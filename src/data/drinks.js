// Drinks & bites shop — everything you'd want to change lives in this file.
// Add a drink: copy one object in `drinks`, give it a unique `id`, done.
// Add a bite: same, but keep `kind: "bite"` and `category: "Bites"`.
// Hide a drink temporarily: set `available: false` (shows "Sold out").
//
// Photos: currently free-to-use Unsplash stock photos (unsplash.com/license).
// Swap in your own shots when you have them — put the file in
// public/images/drinks/ and set e.g. image: "/images/drinks/matcha.jpg".
// Set image: "" to fall back to the illustrated cup.

export const shop = {
  // ── Payments & orders ────────────────────────────────────────────────
  // Paystack public key from dashboard.paystack.com → Settings → API Keys.
  // Use pk_test_... while testing, pk_live_... to take real money.
  // Leave empty ("") to hide the "Pay now" button.
  paystackPublicKey: "",

  // WhatsApp number that receives orders, international format, digits
  // only, no + or spaces. e.g. "2348012345678". Leave "" to hide.
  whatsappNumber: "",

  // If both of the above are empty, orders go to this inbox by email.
  orderEmail: "hello@joinbreakfastclub.world",

  // ── Fulfilment ───────────────────────────────────────────────────────
  deliveryFee: 1500, // ₦, flat, within Abeokuta
  pickupLabel: "Pick up at the Saturday meetup",
  deliveryLabel: "Deliver to me",
  deliveryDetail: "Within Abeokuta · Saturday morning",

  // ── Schedule (Lagos time) ────────────────────────────────────────────
  // Orders are for the next meetup day. After the cut-off, new orders roll
  // to the following week.
  meetupWeekday: 6, // 0 = Sunday … 6 = Saturday
  meetupTime: "7:00 AM",
  cutoffDaysBefore: 1, // 1 = the day before (Friday)
  cutoffHour: 21, // 24h clock → 9 PM
  // Weeks with no meetup, as "YYYY-MM-DD". Orders skip to the next week.
  closedDates: [],
};

// Customisation groups. First choice in each list is the default. `extra`
// is added to the drink price. Turn a group on for a drink by listing it in
// that drink's `options`.
export const optionGroups = {
  milk: {
    label: "Milk",
    choices: [
      { label: "Whole milk", extra: 0 },
      { label: "Oat milk", extra: 500 },
    ],
  },
  sweetness: {
    label: "Sweetness",
    choices: [
      { label: "Regular", extra: 0 },
      { label: "Less sweet", extra: 0 },
      { label: "No sugar", extra: 0 },
    ],
  },
  ice: {
    label: "Ice",
    choices: [
      { label: "Regular ice", extra: 0 },
      { label: "Less ice", extra: 0 },
      { label: "No ice", extra: 0 },
    ],
  },
};

export const drinksPage = {
  eyebrow: "Breakfast Club Drinks & Bites",
  heading: "Fresh drinks & bites, made for Saturday mornings.",
  sub: "Order ahead and grab yours at the meetup, or get it delivered anywhere in Abeokuta.",
  howItWorks: [
    { title: "Pick your drinks & bites", body: "Choose a size and how you like it. Pair any drink with a bite to save." },
    { title: "Check out", body: "Pay securely online, or send the order to us on WhatsApp." },
    { title: "Sip", body: "Collect it at the Saturday meetup or have it brought to your door." },
  ],
  faqs: [
    {
      q: "When is pickup?",
      a: "Every Saturday at the community meetup from 7:00 AM. Your name will be on your cup.",
    },
    {
      q: "Where do you deliver?",
      a: "Anywhere within Abeokuta for a flat fee. We'll call to confirm your time before we head out.",
    },
    {
      q: "Can I order for a group or event?",
      a: "Yes — add everything to your cart, or email us for larger orders and partnerships.",
    },
  ],
};

export const categories = ["All", "Coffee", "Matcha", "Smoothies", "Teas & Juices", "Bites"];

// ── Breakfast combo ──────────────────────────────────────────────────────
// Every drink paired with a bite in the same order gets `discount` off,
// applied automatically. 2 drinks + 1 bite = 1 combo; 2 + 2 = 2 combos.
// Set enabled: false to switch it off.
export const combo = {
  enabled: true,
  discount: 500, // ₦ off per drink + bite pair
  label: "Breakfast combo",
  pitch: "Any drink + any bite",
};

export const drinks = [
  {
    id: "iced-caramel-latte",
    name: "Iced Caramel Latte",
    category: "Coffee",
    description: "Double-shot espresso over chilled milk and ice, finished with a slow caramel drizzle.",
    tags: ["Caffeinated", "Contains dairy"],
    sizes: [
      { label: "Regular", price: 3500 },
      { label: "Large", price: 4500 },
    ],
    badge: "Bestseller",
    available: true,
    options: ["milk", "sweetness", "ice"],
    image: "https://images.unsplash.com/photo-1527678357412-ef45dfbd9ecc?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#b07a4a", top: "#f3e2c7", accent: "#6b4226", bg: "#f6e7cf" },
  },
  {
    id: "iced-matcha-latte",
    name: "Iced Matcha Latte",
    category: "Matcha",
    description: "Ceremonial-grade matcha whisked smooth and poured over cold milk. Calm energy, no crash.",
    tags: ["Caffeinated", "Contains dairy"],
    sizes: [
      { label: "Regular", price: 4000 },
      { label: "Large", price: 5000 },
    ],
    badge: "",
    available: true,
    options: ["milk", "sweetness", "ice"],
    image: "https://images.unsplash.com/photo-1749280447307-31a68eb38673?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#8cb04a", top: "#eef3dc", accent: "#4f7a1f", bg: "#e9f0d4" },
  },
  {
    id: "berry-sunrise-smoothie",
    name: "Berry Sunrise Smoothie",
    category: "Smoothies",
    description: "Strawberry, banana and a splash of yoghurt blended thick. Breakfast in a cup.",
    tags: ["No added sugar", "Contains dairy"],
    sizes: [
      { label: "Regular", price: 4000 },
      { label: "Large", price: 5000 },
    ],
    badge: "",
    available: true,
    options: ["sweetness"],
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#e0566f", top: "#f7b3c0", accent: "#a8243f", bg: "#fbe0e3" },
  },
  {
    id: "zobo-hibiscus-iced-tea",
    name: "Zobo Hibiscus Iced Tea",
    category: "Teas & Juices",
    description: "Our take on the classic — hibiscus steeped with ginger, pineapple and clove, served ice cold.",
    tags: ["Dairy-free", "Caffeine-free"],
    sizes: [
      { label: "Regular", price: 2000 },
      { label: "Large", price: 2800 },
    ],
    badge: "Local favourite",
    available: true,
    options: ["sweetness", "ice"],
    image: "https://images.unsplash.com/photo-1684439670717-b1147a7e7534?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#8e1b3a", top: "#b8324f", accent: "#5c0f24", bg: "#f5dbe0" },
  },
  {
    id: "tropical-glow-juice",
    name: "Tropical Glow Juice",
    category: "Teas & Juices",
    description: "Fresh-pressed pineapple, orange and a kick of ginger. Bright, zesty, wakes you right up.",
    tags: ["Dairy-free", "Caffeine-free"],
    sizes: [
      { label: "Regular", price: 3000 },
      { label: "Large", price: 3800 },
    ],
    badge: "",
    available: true,
    options: ["ice"],
    image: "https://images.unsplash.com/photo-1607644536940-6c300b5784c5?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#fca10c", top: "#ffd06b", accent: "#fc5b0d", bg: "#fdebc8" },
  },
  // ── Breakfast bites (kind: "bite") ────────────────────────────────────
  {
    id: "banana-bread",
    kind: "bite",
    name: "Banana Bread",
    category: "Bites",
    description: "A thick slice of our moist banana loaf — ripe bananas, a little cinnamon, baked fresh for Saturday.",
    tags: ["Contains gluten", "Contains egg"],
    sizes: [{ label: "Slice", price: 1500 }],
    badge: "",
    available: true,
    image: "https://images.unsplash.com/photo-1632931057819-4eefffa8e007?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#c68a4e", top: "#f1d9b5", accent: "#7a4a22", bg: "#f6e7cf" },
  },
  {
    id: "chocolate-chip-cookies",
    kind: "bite",
    name: "Chocolate Chip Cookies",
    category: "Bites",
    description: "Two chewy, golden cookies loaded with chocolate chips. The easiest yes of the morning.",
    tags: ["Contains gluten", "Contains dairy"],
    sizes: [{ label: "Pack of 2", price: 1200 }],
    badge: "",
    available: true,
    image: "https://images.unsplash.com/photo-1625876981820-be17a6807189?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#b9844f", top: "#ecd3ad", accent: "#5c3a1c", bg: "#f3e4cc" },
  },
  {
    id: "granola-yoghurt-cup",
    kind: "bite",
    name: "Granola Yoghurt Cup",
    category: "Bites",
    description: "Creamy yoghurt layered with crunchy granola and fresh fruit. Light, filling, post-workout friendly.",
    tags: ["Contains dairy", "Contains oats"],
    sizes: [{ label: "Cup", price: 2500 }],
    badge: "Post-workout",
    available: true,
    image: "https://images.unsplash.com/photo-1567769541495-338ee7203e3c?w=800&h=600&fit=crop&auto=format&q=75",
    colors: { liquid: "#e9dcc7", top: "#fbf5ea", accent: "#a8243f", bg: "#f5ede0" },
  },
];

// ── Pricing (shared by the site and the payment-check server function) ──
export function defaultOptions(drink) {
  return Object.fromEntries(
    (drink.options || []).map((g) => [g, optionGroups[g].choices[0].label])
  );
}

// Returns the unit price, or null if the size/options aren't valid.
export function unitPrice(drink, sizeLabel, opts = {}) {
  const size = drink?.sizes.find((s) => s.label === sizeLabel);
  if (!size) return null;
  let price = size.price;
  for (const group of drink.options || []) {
    const choice = optionGroups[group].choices.find((c) => c.label === opts[group]);
    if (!choice) return null;
    price += choice.extra;
  }
  return price;
}

// Short description of non-default choices, e.g. "Oat milk · Less ice".
export function optionsSummary(drink, opts = {}) {
  return (drink.options || [])
    .filter((g) => opts[g] && opts[g] !== optionGroups[g].choices[0].label)
    .map((g) => opts[g])
    .join(" · ");
}

export const isBite = (drink) => drink?.kind === "bite";

// "Large · Oat milk · Less ice" — size is skipped when there's only one.
export function itemDetail(drink, sizeLabel, opts = {}) {
  return [drink.sizes.length > 1 ? sizeLabel : null, optionsSummary(drink, opts)]
    .filter(Boolean)
    .join(" · ");
}

// items: [{ drink, qty }] → { pairs, discount }
export function comboDiscount(items) {
  if (!combo.enabled) return { pairs: 0, discount: 0 };
  let drinkQty = 0;
  let biteQty = 0;
  for (const i of items) {
    if (isBite(i.drink)) biteQty += i.qty;
    else drinkQty += i.qty;
  }
  const pairs = Math.min(drinkQty, biteQty);
  return { pairs, discount: pairs * combo.discount, drinkQty, biteQty };
}
