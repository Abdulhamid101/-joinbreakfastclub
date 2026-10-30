// Every piece of the site the owner can edit from /admin. The key is the
// name the change is stored under; `target` is the live object the
// components read, so applying a saved change updates the whole site
// without touching component code.
//
// Add a new editable section: export it from a data file, then add a line
// here. Shared by the browser and the server functions — keep it plain JS.
import * as content from "./content.js";
import * as drinks from "./drinks.js";
import * as cal from "./events.js";

export const groups = [
  { id: "calendar", label: "Calendar" },
  { id: "drinks", label: "Drinks shop" },
  { id: "home", label: "Home page" },
  { id: "footer", label: "Footer & contact" },
];

export const sections = {
  // Calendar
  events: { group: "calendar", label: "Events", target: cal.events, itemTemplate: cal.eventTemplate },
  calendarPage: { group: "calendar", label: "Calendar page text", target: cal.calendarPage },

  // Drinks shop
  drinks: { group: "drinks", label: "Menu items & prices", target: drinks.drinks },
  shop: { group: "drinks", label: "Orders, delivery & schedule", target: drinks.shop },
  combo: { group: "drinks", label: "Breakfast combo deal", target: drinks.combo },
  optionGroups: { group: "drinks", label: "Drink options (milk, sweetness, ice)", target: drinks.optionGroups },
  categories: { group: "drinks", label: "Menu categories", target: drinks.categories },
  drinksPage: { group: "drinks", label: "Drinks page text & FAQs", target: drinks.drinksPage },

  // Home page
  site: { group: "home", label: "Brand basics", target: content.site },
  hero: { group: "home", label: "Hero (top banner)", target: content.hero },
  belief: { group: "home", label: "Belief lines", target: content.belief },
  mission: { group: "home", label: "What is Breakfast Club", target: content.mission },
  valuesSection: { group: "home", label: "Move · Eat · Connect — heading", target: content.valuesSection },
  values: { group: "home", label: "Move · Eat · Connect — cards", target: content.values },
  experiencesSection: { group: "home", label: "Our experiences — heading", target: content.experiencesSection },
  experienceCategories: { group: "home", label: "Our experiences — cards", target: content.experienceCategories },
  menuSection: { group: "home", label: "Breakfast & beverages — heading", target: content.menuSection },
  menuItems: { group: "home", label: "Breakfast & beverages — items", target: content.menuItems },
  timelineSection: { group: "home", label: "Saturday morning story — heading", target: content.timelineSection },
  timeline: { group: "home", label: "Saturday morning story — steps", target: content.timeline },
  saturday: { group: "home", label: "Saturday at Breakfast Club", target: content.saturday },
  moreThanMeetup: { group: "home", label: "More than a meetup", target: content.moreThanMeetup },
  vision: { group: "home", label: "Our vision", target: content.vision },
  audience: { group: "home", label: "Who it's for", target: content.audience },
  partnerships: { group: "home", label: "Partnerships", target: content.partnerships },
  cta: { group: "home", label: "Closing call to action", target: content.cta },

  // Footer
  footerCta: { group: "footer", label: "Footer banner", target: content.footerCta },
  footerColumns: { group: "footer", label: "Footer link columns", target: content.footerColumns },
  newsletter: { group: "footer", label: "Newsletter box", target: content.newsletter },
  footerBottom: { group: "footer", label: "Footer bottom line", target: content.footerBottom },
};

// Deep copies of the code defaults, taken before any saved change is
// applied. Used to reset sections and as the shape the validator checks
// against.
export const defaults = Object.fromEntries(
  Object.entries(sections).map(([key, s]) => [key, structuredClone(s.target)])
);
