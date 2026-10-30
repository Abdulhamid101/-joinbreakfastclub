// Admin authentication.
//
// • Password is stored only as a scrypt hash (ADMIN_PASSWORD_HASH), made
//   with `npm run admin:setup`. The plain password never lives anywhere.
// • Optional (recommended) 2-step login: 6-digit code from Google
//   Authenticator / Authy (ADMIN_TOTP_SECRET). Codes can't be reused.
// • Sessions are random 256-bit IDs kept server-side in Redis, signed with
//   ADMIN_SESSION_SECRET, sent in a __Host- cookie that is HttpOnly,
//   Secure and SameSite=Strict. 2h idle timeout, 12h maximum.
// • "Log out everywhere" invalidates every session at once.
import crypto from "node:crypto";
import { getJSON, pipeline, redis } from "./redis.js";
import { clientIp } from "./http.js";

export const COOKIE = "__Host-bc_admin";
const IDLE_SEC = 2 * 60 * 60;
const MAX_SEC = 12 * 60 * 60;

export function authConfig() {
  return {
    password: Boolean(process.env.ADMIN_PASSWORD_HASH),
    secret: (process.env.ADMIN_SESSION_SECRET || "").length >= 32,
    totp: Boolean(process.env.ADMIN_TOTP_SECRET),
  };
}

// ── Password ──────────────────────────────────────────────────────────
// Format: scrypt$N$r$p$saltB64$hashB64
const scrypt = (pw, salt, keylen, opts) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(pw, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key)))
  );

export async function hashPassword(password) {
  const N = 32768, r = 8, p = 1;
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, 32, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

// A fixed dummy hash so a check takes the same time whether or not the
// password env var is valid.
const DUMMY = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export async function verifyPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || DUMMY;
  const [alg, N, r, p, saltB64, hashB64] = stored.split("$");
  if (alg !== "scrypt" || typeof password !== "string" || password.length > 256) {
    await scrypt("x", "dummy-salt", 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return false;
  }
  const expected = Buffer.from(hashB64, "base64");
  const got = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: 128 * 1024 * 1024,
  });
  return stored !== DUMMY && crypto.timingSafeEqual(got, expected);
}

// ── TOTP (RFC 6238) ───────────────────────────────────────────────────
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Decode(s) {
  const clean = s.replace(/[\s=-]/g, "").toUpperCase();
  let bits = 0, value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) throw new Error("Bad base32");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function base32Encode(buf) {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function totpAt(secret, counter) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const code = (h.readUInt32BE(o) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

// Accepts the current 30s step ±1 (clock drift). Rejects a code that was
// already used (replay protection).
export async function verifyTotp(code) {
  const secret = process.env.ADMIN_TOTP_SECRET;
  if (!secret) return true;
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) return false;
  const now = Math.floor(Date.now() / 30000);
  for (const c of [now - 1, now, now + 1]) {
    const expected = totpAt(secret, c);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code))) {
      const fresh = await redis("SET", `bc:totp:used:${c}`, "1", "NX", "EX", 120);
      return fresh === "OK";
    }
  }
  return false;
}

// ── Sessions ──────────────────────────────────────────────────────────
const sign = (sid) =>
  crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(sid).digest("base64url");

function readCookie(request) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE) return v.join("=");
  }
  return null;
}

const epochKey = "bc:admin:epoch";

export async function createSession(request) {
  const sid = crypto.randomBytes(32).toString("base64url");
  const epoch = (await redis("GET", epochKey)) || "0";
  const now = Date.now();
  await redis(
    "SET",
    `bc:sess:${sid}`,
    JSON.stringify({
      created: now,
      epoch,
      ip: clientIp(request),
      ua: (request.headers.get("user-agent") || "").slice(0, 200),
    }),
    "EX",
    IDLE_SEC
  );
  return `${COOKIE}=${sid}.${sign(sid)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_SEC}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

// Returns the session or null. Slides the idle timeout on every call.
export async function getSession(request) {
  if (!authConfig().secret) return null;
  const raw = readCookie(request);
  if (!raw) return null;
  const [sid, sig] = raw.split(".");
  if (!sid || !sig || sid.length !== 43) return null;
  const expected = sign(sid);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  const session = await getJSON(`bc:sess:${sid}`);
  if (!session) return null;
  const epoch = (await redis("GET", epochKey)) || "0";
  if (session.epoch !== epoch || Date.now() - session.created > MAX_SEC * 1000) {
    await redis("DEL", `bc:sess:${sid}`);
    return null;
  }
  await redis("EXPIRE", `bc:sess:${sid}`, IDLE_SEC);
  return { ...session, sid };
}

export async function destroySession(sid) {
  if (sid) await redis("DEL", `bc:sess:${sid}`);
}

export async function destroyAllSessions() {
  await pipeline([["INCR", epochKey]]);
}
