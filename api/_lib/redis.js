// Minimal Upstash Redis client over its REST API (no extra npm package).
// Vercel → Storage → Upstash for Redis sets KV_REST_API_URL/TOKEN; a
// database created directly on upstash.com gives UPSTASH_REDIS_REST_*.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const hasRedis = () => Boolean(URL_ && TOKEN);

async function call(path, body) {
  if (!hasRedis()) throw new Error("Storage not configured (KV_REST_API_URL / KV_REST_API_TOKEN)");
  const res = await fetch(`${URL_}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`Storage error ${res.status}`);
  return data;
}

// redis("GET", "key") → result
export async function redis(...cmd) {
  const data = await call("", cmd.map(String));
  if (data.error) throw new Error(`Storage: ${data.error}`);
  return data.result;
}

// pipeline([["INCR","k"],["EXPIRE","k","60"]]) → [result, result]
export async function pipeline(cmds) {
  const data = await call("/pipeline", cmds.map((c) => c.map(String)));
  return data.map((r) => {
    if (r.error) throw new Error(`Storage: ${r.error}`);
    return r.result;
  });
}

export async function getJSON(key) {
  const raw = await redis("GET", key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
