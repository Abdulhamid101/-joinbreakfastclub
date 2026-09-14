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
      { label: "The Experience", href: "#experiences" },
      { label: "Saturday Mornings", href: "#saturday" },
      { label: "Who It's For", href: "#audience" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Fitness & Movement", href: "#experiences" },
      { label: "Wellness Experiences", href: "#experiences" },
      { label: "Community & Social", href: "#community" },
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

// 03 — Our Experiences
export const experiencesSection = {
  eyebrow: "Something for every body",
  heading: "Our experiences.",
  intro: "Breakfast Club brings different forms of wellness into one community.",
};

export const experienceCategories = [
  {
    title: "Fitness & Movement",
    body: "From beginner-friendly activities to more energetic sessions, there's always a way to get moving. And we're always exploring new ways to move.",
    tags: [
      "Running",
      "Walking",
      "Hiking",
      "Yoga",
      "Pilates",
      "Tabata",
      "Dance",
      "Swimming",
      "Fitness Classes",
    ],
  },
  {
    title: "Wellness Experiences",
    body: "Wellness isn't only physical. We create experiences around the things that help us live better, feel better, and understand ourselves better.",
    tags: [
      "Wellness Talks",
      "Health Check-ups",
      "Mental Wellness Conversations",
      "Community Walks",
      "Cause-Based Activities",
      "Educational Sessions",
    ],
  },
  {
    title: "Community & Social",
    body: "Sometimes the best part of wellness is simply having people around you.",
    tags: [
      "Community Meetups",
      "Networking",
      "Social Experiences",
      "Games & Activities",
      "Special Events",
    ],
  },
];

// 04 — Breakfast & Beverages
export const menuSection = {
  eyebrow: "Yes, there's actually breakfast",
  heading: "Breakfast & beverages.",
  intro:
    "We believe the best mornings deserve good food. At our community meetups, we serve a rotating selection of simple breakfast options and beverages designed to complement the experience.",
  closing: "The menu evolves with the community.",
};

export const menuItems = [
  { title: "Coffee", body: "Cappuccino, latte and more." },
  { title: "Smoothies", body: "Fresh, refreshing fruit-based blends." },
  {
    title: "Matcha",
    body: "For those who like their mornings with a little more energy.",
  },
  {
    title: "Iced Teas & Juices",
    body: "Refreshing options for the warmer mornings.",
  },
  {
    title: "Breakfast Bites",
    body: "From banana bread and cookies to other simple breakfast treats.",
  },
];

// 06 — More Than A Meetup
export const moreThanMeetup = {
  eyebrow: "More than a meetup",
  heading: "We're building a community.",
  body:
    "Breakfast Club isn't just an event you attend. It's a community you can belong to. As we grow, our experiences will extend beyond Saturday morning meetups into:",
  initiatives: [
    "Community wellness initiatives",
    "Health & fitness programs",
    "Cause-based walks and runs",
    "Fundraisers",
    "Community service",
    "Wellness education",
    "Collaborations & partnerships",
  ],
  closing:
    "Because when people come together, wellness can create an impact far beyond the individual.",
};

// 07 — Our Vision
export const vision = {
  eyebrow: "Our vision",
  heading: "A healthier, more connected community.",
  intro:
    "We want to make wellness more accessible, social, and enjoyable. We're building a community where taking care of yourself doesn't mean doing it alone.",
  lines: [
    "Where fitness can introduce you to a new friend.",
    "Where breakfast can become a conversation.",
    "Where a Saturday morning can become the highlight of your week.",
    "And where a community can come together to create something bigger than itself.",
  ],
  closing: "This is the world we're building.",
};

// 09 — Partnerships
export const partnerships = {
  eyebrow: "Partnerships",
  heading: "Let's build something healthier together.",
  body:
    "Breakfast Club works with brands, businesses, fitness professionals, wellness practitioners, creators, and organizations that believe in healthier communities. From event sponsorships and product partnerships to wellness activations and community initiatives, we're open to collaborations that create genuine value.",
  ctaLabel: "Partner With Us",
};
