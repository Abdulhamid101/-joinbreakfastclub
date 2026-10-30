// Talks to /api/admin. The custom header + same-origin cookie is what the
// server's CSRF check expects.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function call(action, { method = "GET", body, headers = {} } = {}) {
  let res;
  try {
    res = await fetch(`/api/admin?a=${action}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "X-BC-Admin": "1", ...headers },
      body,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }
  const type = res.headers.get("content-type") || "";
  if (!type.includes("json")) {
    throw new ApiError(
      res.status === 404
        ? "The admin API isn't running here. Use the live site, or `vercel dev` locally."
        : `Server error (${res.status}).`,
      res.status
    );
  }
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    const wait = res.headers.get("retry-after");
    const msg = data.message || `Error ${res.status}`;
    throw new ApiError(wait && res.status === 429 ? `${msg} (about ${Math.ceil(wait / 60)} min)` : msg, res.status);
  }
  return data;
}

const post = (action, data) =>
  call(action, { method: "POST", body: JSON.stringify(data || {}), headers: { "Content-Type": "application/json" } });

export const api = {
  me: () => call("me"),
  login: (password, code) => post("login", { password, code }),
  logout: () => post("logout"),
  logoutAll: () => post("logout-all"),
  content: () => call("content"),
  history: () => call("history"),
  save: (overrides, baseVersion) => post("save", { overrides, baseVersion }),
  restore: (restoreVersion, baseVersion) => post("restore", { restoreVersion, baseVersion }),
  upload: (blob) => call("upload", { method: "POST", body: blob, headers: { "Content-Type": blob.type } }),
};

// Shrinks photos in the browser before upload: max 1600px, JPEG.
export async function prepareImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new ApiError("Please choose a JPG, PNG or WebP image.", 415);
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const q of [0.85, 0.75, 0.6]) {
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", q));
    if (blob && blob.size < 1.4 * 1024 * 1024) return blob;
  }
  throw new ApiError("That image is too large even after shrinking.", 413);
}
