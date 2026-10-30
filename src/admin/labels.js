// Friendly names and help text for fields in the admin. Anything not
// listed here gets an automatic label from its key ("ctaLabel" → "Cta label").
export const LABELS = {
  eyebrow: "Small heading above",
  heading: "Heading",
  headingLines: "Heading lines",
  headingAccentLine: "Highlighted line number (0 = first)",
  sub: "Sub-heading",
  body: "Text",
  intro: "Intro",
  closing: "Closing line",
  ctaLabel: "Button text",
  primaryCta: "Main button text",
  secondaryCta: "Second button text",
  waitlistUrl: "Join button link",
  instagramHandle: "Instagram handle",
  instagramUrl: "Instagram link",
  href: "Link",
  q: "Question",
  a: "Answer",
  // Drinks
  paystackPublicKey: "Paystack PUBLIC key",
  whatsappNumber: "WhatsApp order number",
  orderEmail: "Order email",
  deliveryFee: "Delivery fee (₦)",
  pickupLabel: "Pickup option label",
  deliveryLabel: "Delivery option label",
  deliveryDetail: "Delivery detail",
  meetupWeekday: "Meetup day",
  meetupTime: "Meetup time (shown to customers)",
  cutoffDaysBefore: "Order cut-off: days before meetup",
  cutoffHour: "Order cut-off hour (24h, Lagos)",
  closedDates: "Weeks with no meetup (orders skip these)",
  available: "Available (off = shows Sold out)",
  badge: "Badge (e.g. Bestseller)",
  kind: "Kind",
  options: "Customisation options",
  sizes: "Sizes & prices",
  price: "Price (₦)",
  extra: "Extra cost (₦)",
  colors: "Card colours",
  liquid: "Drink colour",
  top: "Foam / top colour",
  accent: "Accent colour",
  bg: "Background colour",
  discount: "Discount per pair (₦)",
  enabled: "Turned on",
  pitch: "Short pitch",
  choices: "Choices",
  // Calendar
  emptyTitle: "Title for Saturdays with no event yet",
  emptyBody: "Text for Saturdays with no event yet",
  defaultLocation: "Default location",
  defaultStartTime: "Default start time",
  defaultEndTime: "Default end time",
};

export const HINTS = {
  paystackPublicKey: "Starts with pk_live_ (real payments) or pk_test_. NEVER paste the secret sk_ key anywhere here.",
  whatsappNumber: "Digits only, country code first, e.g. 2348012345678. Leave blank to hide WhatsApp ordering.",
  meetupWeekday: "0 = Sunday, 1 = Monday … 6 = Saturday",
  closedDates: "Add a date to skip that week (no meetup, no orders).",
  image: "Upload a photo. JPG/PNG/WebP — it's resized automatically.",
  id: "Internal code — lowercase letters, numbers and dashes. Don't change it for existing items.",
  options: "Which option groups this drink offers: milk, sweetness, ice.",
  kind: "Type 'bite' for food items (counts toward the breakfast combo). Leave as is for drinks.",
  headingAccentLine: "Which heading line gets the highlight colour.",
  href: "Use /page, /#section, https://…, or mailto:…",
};

export function label(key) {
  if (LABELS[key]) return LABELS[key];
  const words = String(key).replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Text fields that get a big box instead of one line.
export const LONG = new Set(["body", "intro", "sub", "description", "a", "closing", "tagline", "pitch", "emptyBody"]);
