// Public: serves images uploaded in the admin (event flyers, drink photos).
// Only JPEG/PNG/WebP are ever stored, and they're served with headers that
// stop a browser from treating them as anything else.
import { redis } from "./_lib/redis.js";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9]{32}$/.test(id)) return new Response("Not found", { status: 404 });

  let stored;
  try {
    stored = JSON.parse((await redis("GET", `bc:img:${id}`)) || "null");
  } catch {
    stored = null;
  }
  if (!stored || !TYPES.has(stored.type)) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(stored.data, "base64"), {
    headers: {
      "Content-Type": stored.type,
      // The id is a hash of the bytes, so the file never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cross-Origin-Resource-Policy": "same-site",
    },
  });
}
