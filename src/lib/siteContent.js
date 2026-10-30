import { applyOverrides } from "../data/overrides.js";

const CACHE_KEY = "bc-content-v1";

// Fetches the owner's saved changes and applies them to the site's data.
// Never blocks the site for long: after 2.5s (or on any error) it uses the
// last copy this browser saw, or the built-in content.
export async function loadSiteContent() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch("/api/content", { signal: controller.signal });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.includes("json")) throw new Error(`content ${res.status}`);
    const data = await res.json();
    applyOverrides(data.overrides || {});
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable */
    }
  } catch {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached?.overrides) applyOverrides(cached.overrides);
    } catch {
      /* use built-in content */
    }
  } finally {
    clearTimeout(timer);
  }
}
