// Applies saved admin changes onto the live data objects the components
// import. Always starts from the code defaults, so removing a change in
// the admin ("Reset to default") really puts the original back.
import { defaults, sections } from "./registry.js";
import { validateOverrides } from "./validate.js";

export function applyOverrides(overrides = {}) {
  let clean;
  try {
    clean = validateOverrides(overrides);
  } catch (err) {
    console.error("Ignoring saved site content:", err.message);
    clean = {};
  }

  for (const [key, { target }] of Object.entries(sections)) {
    const value = structuredClone(key in clean ? clean[key] : defaults[key]);
    if (Array.isArray(target)) {
      target.length = 0;
      target.push(...value);
    } else {
      for (const k of Object.keys(target)) delete target[k];
      // Object sections: defaults first so fields added in code later
      // still exist even if an older saved version lacks them.
      Object.assign(target, structuredClone(defaults[key]), value);
    }
  }
  return clean;
}
