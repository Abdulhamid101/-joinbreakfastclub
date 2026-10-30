// Fades sections in as they scroll into view. Elements opt in with the
// `data-reveal` attribute (optionally style="--d:2" to stagger). Content is
// only hidden once this runs, so the site still shows fully without JS.
export function startReveal() {
  if (typeof IntersectionObserver === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("reveal-on");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
  scan();
  // Pick up anything rendered later (e.g. cart drawer, page changes).
  new MutationObserver(scan).observe(document.getElementById("root"), { childList: true, subtree: true });
}
