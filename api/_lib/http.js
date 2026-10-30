// Request helpers shared by the API functions.
import { hasRedis, pipeline } from "./redis.js";

export const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export const json = (data, status = 200, headers = {}) =>
  Response.json(data, { status, headers: { ...NO_STORE, ...headers } });

// Vercel sets x-real-ip to the real client address (it can't be spoofed
// by the client on Vercel's edge).
export function clientIp(request) {
  return (
    request.headers.get("x-real-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

// Blocks cross-site requests (CSRF): state-changing calls must come from
// our own pages, sent with our custom header (which a plain HTML form or
// another site can't add without a CORS preflight we never approve).
export function sameOrigin(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  if (!origin || !host) return false;
  try {
    if (new URL(origin).host !== host) return false;
  } catch {
    return false;
  }
  return request.headers.get("x-bc-admin") === "1";
}

// Reads a JSON body with a hard size cap.
export async function readJson(request, maxBytes = 64 * 1024) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > maxBytes) throw new Error("Body too large");
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("Body too large");
  return JSON.parse(text);
}

// Fixed-window rate limit. Returns { ok, remaining, retryAfter }.
// Fails open if storage is down so the shop never breaks — except where
// `failClosed` is set (admin login).
export async function rateLimit(key, limit, windowSec, { failClosed = false } = {}) {
  if (!hasRedis()) return { ok: !failClosed, remaining: 0, retryAfter: windowSec };
  try {
    const k = `bc:rl:${key}`;
    const [count, , ttl] = await pipeline([
      ["INCR", k],
      ["EXPIRE", k, windowSec, "NX"],
      ["TTL", k],
    ]);
    return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter: Math.max(1, ttl) };
  } catch (err) {
    console.error("rate limit:", err.message);
    return { ok: !failClosed, remaining: 0, retryAfter: windowSec };
  }
}

export const tooMany = (retryAfter) =>
  json(
    { ok: false, message: "Too many attempts. Please wait and try again." },
    429,
    { "Retry-After": String(retryAfter) }
  );
