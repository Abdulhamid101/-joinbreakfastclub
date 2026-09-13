// All site copy lives here so future updates don't require touching
// component code — edit this file, not the components.

export const site = {
  name: "Breakfast Club",
  tagline: "Wellness begins at breakfast.",
  location: "Abeokuta, Ogun State, Nigeria",
  waitlistUrl: "#join",
  email: "hello@joinbreakfastclub.world",
  instagramHandle: "@joinbreakfastclub",
  instagramUrl: "https://instagram.com/joinbreakfastclub",
};

export const hero = {
  eyebrow: "A wellness community",
  headingLines: ["Wellness begins", "at breakfast."],
  headingAccentLine: 1,
  sub: "A wellness community bringing people together through movement, meaningful experiences, and good food — one Saturday at a time.",
  primaryCta: "Join the Community",
  secondaryCta: "Discover Breakfast Club",
  note: {
    strong: "Every Saturday",
    rest: ["7:00 AM"],
  },
};

// The Breakfast Club philosophy — short standalone lines.
export const belief = {
  lines: [
    "Wellness doesn't have to feel like a chore. It can be something you look forward to.",
    "Wellness is more than exercise. It's movement, nutrition, community, and mental wellbeing.",
    "This is wellness — made social.",
  ],
};

export const mission = {
  eyebrow: "What is Breakfast Club?",
  heading: "Wellness, made social.",
  body:
    "Breakfast Club is a wellness community that brings people together through fitness and wellness experiences, complemented by healthy breakfast and beverage options. We create spaces where people can move their bodies, meet new people, enjoy good food, and start their weekends feeling better than they came. From a morning run or walk to yoga, Pilates, hiking, wellness conversations, and breakfast with the community — Breakfast Club makes wellness social.",
};

// "Move. Eat. Connect." — the eyebrow/heading here were previously
// hardcoded in MorningTimeline.jsx; they now live here with the rest
// of the copy.
export const timelineSection = {
  eyebrow: "Your Saturday morning",
  heading: "Suddenly, Saturday feels different.",
};

export const timeline = [
  {
    time: "1",
    label: "You arrive",
    body: "You arrive early. You move. You sweat. You laugh.",
  },
  {
    time: "2",
    label: "You meet",
    body: "You meet someone new. You grab a drink.",
  },
  {
    time: "3",
    label: "You connect",
    body: "You sit down for breakfast and have a conversation you weren't expecting.",
  },
];

// "Values" section repurposed to carry Move / Eat / Connect — the
// eyebrow/heading were previously hardcoded in Values.jsx.
export const valuesSection = {
  eyebrow: "The Breakfast Club experience",
  heading: "Move. Eat. Connect.",
};

export const values = [
  {
    title: "Move",
    body: "Get active in ways that feel good — from a walk or run to yoga, Pilates, hiking, and more.",
  },
  {
    title: "Eat",
    body: "Enjoy simple, wholesome breakfast and refreshing beverages designed to complement the experience.",
  },
  {
    title: "Connect",
    body: "Meet people, build relationships, and become part of a community.",
  },
];

export const audience = {
  eyebrow: "Who is Breakfast Club for?",
  heading: "Come as you are.",
  body:
    "You don't need to be a runner. You don't need to be super fit. You don't need to know anyone. And you definitely don't need to have your life figured out. Breakfast Club is for anyone who wants to move more, eat better, meet people, try something new, feel better, and be part of something. Whether you're 18 or 65, there's a place for you here.",
};

export const saturday = {
  eyebrow: "Saturday at Breakfast Club",
  heading: "Your Saturday starts here.",
  body: "Our community meetups are designed to give you a healthier, more social way to start your weekend.",
  ctaLabel: "See our next event",
  schedule: [
    { label: "When", value: "Every Saturday" },
    { label: "Time", value: "7:00 AM" },
    { label: "Where", value: "Abeokuta, Ogun State" },
    { label: "Who", value: "Everyone" },
    { label: "What to expect", value: "Move • Eat • Connect" },
  ],
};

export const cta = {
  heading: "Your next Saturday could look different.",
  body: "Come for the workout. Stay for the breakfast. Leave with a community. Join Breakfast Club.",
  ctaLabel: "Join the Community",
};

export const footerCta = {
  heading: "Wellness begins at breakfast.",
  tagline: "A wellness community built around movement, nutrition and connection.",
  ctaLabel: "Join the Community",
};

export const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "What Is Breakfast Club", href: "#why-we-exist" },
      { label: "The Experience", href: "#" },
      { label: "Saturday Mornings", href: "#" },
      { label: "Who It's For", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Fitness & Movement", href: "#" },
      { label: "Wellness Experiences", href: "#" },
      { label: "Community & Social", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "https://instagram.com/joinbreakfastclub" },
      { label: "Contact Us", href: "mailto:hello@joinbreakfastclub.world" },
      { label: "Join the Community", href: "#join" },
    ],
  },
];

export const newsletter = {
  heading: "Stay in the loop",
  body: "Get Breakfast Club updates, events & good stuff.",
  placeholder: "Your email address",
  ctaLabel: "Join",
};

export const footerBottom = {
  copyright: "© 2026 Breakfast Club",
  location: "Abeokuta, Ogun State, Nigeria",
  legalLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "mailto:hello@joinbreakfastclub.world" },
  ],
  tagline: "There's always a seat at the table.",
};
