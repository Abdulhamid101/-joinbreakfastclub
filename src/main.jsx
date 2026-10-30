import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { loadSiteContent } from "./lib/siteContent.js";
import { startReveal } from "./lib/reveal.js";

const root = createRoot(document.getElementById("root"));
const path = window.location.pathname;

if (path === "/admin" || path.startsWith("/admin/")) {
  // The admin lives in its own code chunk — visitors never download it.
  const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));
  root.render(
    <StrictMode>
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    </StrictMode>
  );
} else {
  // Pull in anything the owner changed in /admin before first paint.
  loadSiteContent().finally(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    requestAnimationFrame(startReveal);
  });
}
