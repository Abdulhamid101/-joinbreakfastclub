// Public: the site's saved content (what the owner changed in /admin).
// Cached briefly at Vercel's edge so visitors don't hit the database on
// every page view; changes show up within ~20 seconds.
import { readContent } from "./_lib/content-store.js";

export async function GET() {
  try {
    const { version, overrides } = await readContent();
    return Response.json(
      { version, overrides },
      {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
          "CDN-Cache-Control": "public, s-maxage=20, stale-while-revalidate=600",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    console.error(err);
    // The site falls back to its built-in content.
    return Response.json({ version: 0, overrides: {} }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
