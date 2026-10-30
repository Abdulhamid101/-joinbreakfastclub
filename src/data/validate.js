// Strict checker for content saved from the admin. Runs on the server
// before anything is stored AND in the browser before anything is shown,
// so a bad or tampered value can never reach the page.
//
// Rules: a saved section must have the same shape as the code default
// (same keys, same types), unknown keys are dropped, links must be safe
// (no javascript: etc.), images must be our own uploads or approved hosts,
// and numbers/dates/times/colours must be in range.
import { defaults, sections } from "./registry.js";

export class ValidationError extends Error {
  constructor(path, msg) {
    super(`${path}: ${msg}`);
    this.path = path;
  }
}

const MAX_STRING = 5000;
const MAX_ARRAY = 300;
const MAX_TOTAL_BYTES = 300 * 1024;

const LINK_KEYS = new Set(["href", "url", "mapUrl", "waitlistUrl", "instagramUrl", "ctaUrl"]);
const re = {
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  time: /^([01]\d|2[0-3]):[0-5]\d$/,
  hex: /^#[0-9a-fA-F]{3,8}$/,
  slug: /^[a-z0-9][a-z0-9-]{0,59}$/,
  email: /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9.-]{1,180}\.[a-z]{2,24}$/i,
  digits: /^\d{0,15}$/,
  paystackPk: /^(pk_(test|live)_[A-Za-z0-9]{10,80})?$/,
  ourImage: /^\/api\/image\?id=[a-f0-9]{32}$/,
  localPath: /^\/(?!\/)[A-Za-z0-9._~\-/#?=&%]*$/,
};

// Hosts images may come from besides our own uploads (must also be in the
// Content-Security-Policy img-src in vercel.json).
const IMAGE_HOSTS = new Set(["images.unsplash.com"]);

export function safeLink(v) {
  if (v === "") return true;
  if (v.startsWith("#")) return /^#[A-Za-z0-9_-]*$/.test(v);
  if (v.startsWith("/")) return re.localPath.test(v);
  if (/^mailto:[^\s<>"]+$/i.test(v)) return true;
  if (/^tel:\+?[0-9 ()-]{3,20}$/i.test(v)) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}

export function safeImage(v) {
  if (v === "") return true;
  if (re.ourImage.test(v)) return true;
  if (/^\/images\/[A-Za-z0-9._\-/]+\.(jpe?g|png|webp|avif|gif)$/i.test(v)) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && IMAGE_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function cleanString(v, key, path, parentKey) {
  if (typeof v !== "string") throw new ValidationError(path, "should be text");
  // Strip control characters except newline/tab.
  // eslint-disable-next-line no-control-regex
  const s = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
  if (s.length > MAX_STRING) throw new ValidationError(path, "is too long");

  const fail = (msg) => {
    throw new ValidationError(path, msg);
  };
  if (LINK_KEYS.has(key) && !safeLink(s)) fail("isn't an allowed link (use https://, /page, #section, mailto: or tel:)");
  if (key === "image" && !safeImage(s)) fail("must be an uploaded image");
  if (parentKey === "colors" && !re.hex.test(s)) fail("must be a colour like #84b82f");
  if ((key === "date" || parentKey === "closedDates") && !re.date.test(s)) fail("must be a date (YYYY-MM-DD)");
  if ((key === "startTime" || key === "endTime") && s !== "" && !re.time.test(s)) fail("must be a time like 07:00");
  if (key === "id" && !re.slug.test(s)) fail("must be lowercase letters, numbers and dashes");
  if ((key === "email" || key === "orderEmail") && !re.email.test(s)) fail("must be an email address");
  if (key === "whatsappNumber" && !re.digits.test(s)) fail("must be digits only, e.g. 2348012345678");
  if (key === "paystackPublicKey" && !re.paystackPk.test(s)) fail("must start with pk_live_ or pk_test_ (never the secret key)");
  return s;
}

const NUMBER_RULES = {
  meetupWeekday: [0, 6],
  cutoffHour: [0, 23],
  cutoffDaysBefore: [0, 6],
  headingAccentLine: [0, 20],
};

function cleanNumber(v, key, path) {
  if (typeof v !== "number" || !Number.isFinite(v)) throw new ValidationError(path, "should be a number");
  const [min, max] = NUMBER_RULES[key] || [0, 10_000_000];
  if (v < min || v > max) throw new ValidationError(path, `must be between ${min} and ${max}`);
  return Math.round(v);
}

// For arrays of objects with differing keys (e.g. drinks where only some
// have `kind` or `options`): allowed keys = union, required = intersection.
function arrayItemShape(arr, itemTemplate) {
  if (itemTemplate) return { template: itemTemplate, required: Object.keys(itemTemplate) };
  if (!arr.length) return { template: "", required: [] }; // e.g. closedDates
  if (typeof arr[0] !== "object" || arr[0] === null || Array.isArray(arr[0])) {
    return { template: arr[0], required: [] };
  }
  const template = {};
  let required = Object.keys(arr[0]);
  for (const item of arr) {
    for (const [k, val] of Object.entries(item)) if (!(k in template)) template[k] = val;
    required = required.filter((k) => k in item);
  }
  return { template, required };
}

function clean(value, template, path, key, parentKey, depth, itemTemplate) {
  if (depth > 8) throw new ValidationError(path, "is nested too deeply");

  if (typeof template === "string") return cleanString(value, key, path, parentKey);
  if (typeof template === "number") return cleanNumber(value, key, path);
  if (typeof template === "boolean") {
    if (typeof value !== "boolean") throw new ValidationError(path, "should be on/off");
    return value;
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(value)) throw new ValidationError(path, "should be a list");
    if (value.length > MAX_ARRAY) throw new ValidationError(path, "has too many items");
    const { template: t, required } = arrayItemShape(template, itemTemplate);
    return value.map((item, i) => {
      const p = `${path}[${i + 1}]`;
      const out = clean(item, t, p, key, key, depth + 1);
      if (t && typeof t === "object") {
        for (const r of required) if (!(r in out)) throw new ValidationError(p, `is missing "${r}"`);
      }
      return out;
    });
  }

  if (template && typeof template === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new ValidationError(path, "should be a group of fields");
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (!Object.prototype.hasOwnProperty.call(template, k)) continue; // drop unknown keys
      if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
      out[k] = clean(v, template[k], `${path} → ${k}`, k, key, depth + 1);
    }
    return out;
  }

  throw new ValidationError(path, "unsupported value");
}

function unique(list, path) {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item.id)) throw new ValidationError(path, `two items share the id "${item.id}"`);
    seen.add(item.id);
  }
}

// Returns a cleaned copy of `overrides` or throws ValidationError.
export function validateOverrides(overrides) {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    throw new ValidationError("content", "is not valid");
  }
  if (JSON.stringify(overrides).length > MAX_TOTAL_BYTES) {
    throw new ValidationError("content", "is too large");
  }

  const out = {};
  for (const [key, value] of Object.entries(overrides)) {
    const section = sections[key];
    if (!section || !Object.prototype.hasOwnProperty.call(sections, key)) continue;
    out[key] = clean(value, defaults[key], section.label, key, null, 0, section.itemTemplate);
  }

  // Cross-checks the pricing code relies on.
  const drinks = out.drinks || defaults.drinks;
  const groups = { ...defaults.optionGroups, ...(out.optionGroups || {}) };
  unique(drinks, sections.drinks.label);
  drinks.forEach((d, i) => {
    const p = `${sections.drinks.label}[${i + 1}] ${d.name || ""}`;
    if (!d.sizes?.length) throw new ValidationError(p, "needs at least one size/price");
    for (const g of d.options || []) {
      if (!groups[g]) throw new ValidationError(p, `uses an unknown option "${g}"`);
    }
  });
  for (const [name, g] of Object.entries(groups)) {
    if (!g.choices?.length) throw new ValidationError(`${sections.optionGroups.label} → ${name}`, "needs at least one choice");
  }
  if (out.events) unique(out.events, sections.events.label);

  return out;
}
