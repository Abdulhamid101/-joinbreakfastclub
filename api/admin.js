// Admin API — every action the /admin dashboard can take. One function
// keeps the Vercel function count low. Actions are picked with ?a=…
//
// Every request is checked for: storage configured, a valid session (except
// login/me), same-origin + custom header on writes (CSRF), body size, and
// rate limits. Every change is written to an audit log.
import crypto from "node:crypto";
import {
  authConfig,
  clearCookie,
  createSession,
  destroyAllSessions,
  destroySession,
  getSession,
  verifyPassword,
  verifyTotp,
} from "./_lib/auth.js";
import {
  ConflictError,
  audit,
  listAudit,
  listHistory,
  readContent,
  saveContent,
} from "./_lib/content-store.js";
import { clientIp, json, rateLimit, readJson, sameOrigin, tooMany } from "./_lib/http.js";
import { notifyOwner } from "./_lib/orders.js";
import { hasRedis, redis } from "./_lib/redis.js";
import { ValidationError } from "../src/data/validate.js";

const MAX_IMAGE = 1.5 * 1024 * 1024;

function setupStatus() {
  const a = authConfig();
  return { storage: hasRedis(), password: a.password, secret: a.secret, totp: a.totp };
}

const ready = (s) => s.storage && s.password && s.secret;

export async function GET(request) {
  const action = new URL(request.url).searchParams.get("a");
  const setup = setupStatus();

  if (action === "me") {
    const session = ready(setup) ? await getSession(request).catch(() => null) : null;
    return json({ authed: Boolean(session), setup: { ...setup, ready: ready(setup) } });
  }

  if (!ready(setup)) return json({ ok: false, message: "Admin isn't set up yet." }, 503);
  const session = await getSession(request);
  if (!session) return json({ ok: false, message: "Please log in." }, 401);

  if (action === "content") return json({ ok: true, ...(await readContent()) });
  if (action === "history") {
    const [history, log] = await Promise.all([listHistory(), listAudit()]);
    return json({
      ok: true,
      history: history.map((h) => ({ version: h.version, updatedAt: h.updatedAt, sections: Object.keys(h.overrides || {}) })),
      audit: log,
    });
  }
  return json({ ok: false, message: "Unknown action" }, 404);
}

export async function POST(request) {
  const action = new URL(request.url).searchParams.get("a");
  const setup = setupStatus();
  if (!ready(setup)) return json({ ok: false, message: "Admin isn't set up yet." }, 503);
  if (!sameOrigin(request)) return json({ ok: false, message: "Blocked." }, 403);

  const ip = clientIp(request);

  // ── Login ──────────────────────────────────────────────────────────
  if (action === "login") {
    // 5 tries per 15 min per IP, 60 per hour site-wide (slows down anyone
    // rotating IPs). Fails closed if storage is unreachable.
    const perIp = await rateLimit(`login:ip:${ip}`, 5, 15 * 60, { failClosed: true });
    const global = await rateLimit("login:all", 60, 60 * 60, { failClosed: true });
    if (!perIp.ok || !global.ok) {
      if (!perIp.ok) {
        const first = await redis("SET", `bc:lockalert:${ip}`, "1", "NX", "EX", 3600).catch(() => null);
        if (first === "OK") {
          await notifyOwner(
            "⚠️ Breakfast Club admin: login blocked",
            `Too many wrong admin passwords from IP ${ip}. Login is paused for that address.`
          );
        }
      }
      await audit("login-blocked", request);
      return tooMany(Math.max(perIp.retryAfter, global.ok ? 0 : global.retryAfter));
    }

    let body;
    try {
      body = await readJson(request, 2048);
    } catch {
      return json({ ok: false, message: "Bad request" }, 400);
    }
    const passOk = await verifyPassword(body.password);
    const codeOk = passOk && (await verifyTotp(String(body.code || "")));
    if (!passOk || !codeOk) {
      await audit("login-failed", request);
      // Same message either way — don't reveal which part was wrong.
      return json({ ok: false, message: setup.totp ? "Wrong password or code." : "Wrong password." }, 401);
    }

    const cookie = await createSession(request);
    await audit("login", request);
    await notifyOwner(
      "Breakfast Club admin login",
      `Someone just logged in to the website admin.\nIP: ${ip}\nDevice: ${(request.headers.get("user-agent") || "").slice(0, 120)}\n\nIf this wasn't you, change the admin password in Vercel now.`
    ).catch(() => {});
    return json({ ok: true }, 200, { "Set-Cookie": cookie });
  }

  // ── Everything below needs a session ──────────────────────────────
  const session = await getSession(request);
  if (!session) return json({ ok: false, message: "Please log in." }, 401, { "Set-Cookie": clearCookie() });

  const writes = await rateLimit(`admin:write:${session.sid}`, 120, 60 * 60);
  if (!writes.ok) return tooMany(writes.retryAfter);

  if (action === "logout") {
    await destroySession(session.sid);
    await audit("logout", request);
    return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
  }

  if (action === "logout-all") {
    await destroyAllSessions();
    await audit("logout-all", request);
    return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
  }

  if (action === "save" || action === "restore") {
    let body;
    try {
      body = await readJson(request, 400 * 1024);
    } catch {
      return json({ ok: false, message: "That's too much content to save at once." }, 413);
    }
    try {
      let overrides = body.overrides;
      if (action === "restore") {
        const old = (await listHistory()).find((h) => h.version === body.restoreVersion);
        if (!old) return json({ ok: false, message: "That version no longer exists." }, 404);
        overrides = old.overrides;
      }
      const doc = await saveContent(overrides, body.baseVersion, { at: new Date().toISOString(), ip });
      await audit(action, request, {
        version: doc.version,
        sections: Object.keys(doc.overrides),
        ...(action === "restore" ? { from: body.restoreVersion } : {}),
      });
      return json({ ok: true, ...doc });
    } catch (err) {
      if (err instanceof ValidationError) return json({ ok: false, message: err.message }, 422);
      if (err instanceof ConflictError) return json({ ok: false, message: err.message }, 409);
      console.error(err);
      return json({ ok: false, message: "Couldn't save right now. Try again." }, 500);
    }
  }

  if (action === "upload") {
    const uploads = await rateLimit(`admin:upload:${session.sid}`, 60, 60 * 60);
    if (!uploads.ok) return tooMany(uploads.retryAfter);
    const len = Number(request.headers.get("content-length") || 0);
    if (len > MAX_IMAGE) return json({ ok: false, message: "Image is too big (max 1.5 MB)." }, 413);
    const bytes = Buffer.from(await request.arrayBuffer());
    if (bytes.length > MAX_IMAGE || bytes.length < 100) {
      return json({ ok: false, message: "Image is too big or empty." }, 413);
    }
    // Trust the file's actual bytes, not its name or the declared type.
    const type = sniffImage(bytes);
    if (!type) return json({ ok: false, message: "Only JPG, PNG or WebP images are allowed." }, 415);

    const id = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 32);
    await redis("SET", `bc:img:${id}`, JSON.stringify({ type, data: bytes.toString("base64") }));
    await audit("upload", request, { id, bytes: bytes.length });
    return json({ ok: true, url: `/api/image?id=${id}` });
  }

  return json({ ok: false, message: "Unknown action" }, 404);
}

function sniffImage(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") {
    return "image/webp";
  }
  return null;
}
