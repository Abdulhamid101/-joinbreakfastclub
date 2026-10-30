// Saved site content lives in Redis:
//   bc:content   → { version, updatedAt, overrides }
//   bc:history   → last 25 previous versions (newest first) for undo
//   bc:audit     → last 100 admin actions (login, save, restore …)
import { applyOverrides } from "../../src/data/overrides.js";
import { validateOverrides } from "../../src/data/validate.js";
import { getJSON, hasRedis, pipeline, redis } from "./redis.js";

const KEY = "bc:content";
const HISTORY = "bc:history";
const AUDIT = "bc:audit";
const EMPTY = { version: 0, updatedAt: null, overrides: {} };

export async function readContent() {
  if (!hasRedis()) return EMPTY;
  return (await getJSON(KEY)) || EMPTY;
}

// Server functions that price orders call this so admin price changes
// apply to payment checks too. Falls back to code defaults on error.
let cache = { at: 0, version: -1 };
export async function loadLatestContent() {
  if (Date.now() - cache.at < 10_000) return;
  try {
    const doc = await readContent();
    if (doc.version !== cache.version) applyOverrides(doc.overrides);
    cache = { at: Date.now(), version: doc.version };
  } catch (err) {
    console.error("Couldn't load saved content, using defaults:", err.message);
  }
}

export class ConflictError extends Error {}

export async function saveContent(overrides, baseVersion, meta) {
  const clean = validateOverrides(overrides);
  const current = await readContent();
  if (baseVersion !== current.version) {
    throw new ConflictError("The site was changed somewhere else since you opened it. Reload to get the latest.");
  }
  const doc = { version: current.version + 1, updatedAt: new Date().toISOString(), overrides: clean };
  const cmds = [["SET", KEY, JSON.stringify(doc)]];
  if (current.version > 0) {
    cmds.push(["LPUSH", HISTORY, JSON.stringify({ ...current, replacedBy: meta })]);
    cmds.push(["LTRIM", HISTORY, 0, 24]);
  }
  await pipeline(cmds);
  return doc;
}

export async function listHistory() {
  const rows = (await redis("LRANGE", HISTORY, 0, 24)) || [];
  return rows
    .map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function audit(action, request, extra = {}) {
  try {
    const entry = {
      at: new Date().toISOString(),
      action,
      ip: request.headers.get("x-real-ip") || "unknown",
      ua: (request.headers.get("user-agent") || "").slice(0, 120),
      ...extra,
    };
    await pipeline([
      ["LPUSH", AUDIT, JSON.stringify(entry)],
      ["LTRIM", AUDIT, 0, 99],
    ]);
  } catch (err) {
    console.error("audit:", err.message);
  }
}

export async function listAudit() {
  const rows = (await redis("LRANGE", AUDIT, 0, 49)) || [];
  return rows.map((r) => JSON.parse(r));
}
