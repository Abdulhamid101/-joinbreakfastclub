// Calendar — what's happening each Saturday. The owner manages these from
// /admin → Calendar; the list below is only the starting point before
// anything has been saved there.
//
// Each event:
//   date       "YYYY-MM-DD" (Lagos time)
//   startTime  "07:00"  (24h)    endTime "10:00"
//   type       short activity label shown as a chip, e.g. "Run", "Yoga"
//   image      optional flyer — upload it in the admin
//   cancelled  true shows the event struck through with a notice

export const calendarPage = {
  eyebrow: "What's on",
  heading: "Every Saturday, something different.",
  sub: "Runs, walks, yoga, hikes, talks and breakfast with the community. Here's what's coming up — save the date and bring a friend.",
  emptyTitle: "Saturday Meetup",
  emptyBody: "This week's activity will be announced soon. Follow us on Instagram for the reveal.",
  defaultLocation: "Abeokuta, Ogun State",
  defaultStartTime: "07:00",
  defaultEndTime: "10:00",
};

// Activity types offered in the admin dropdown (the owner can still type
// anything).
export const eventTypes = [
  "Run",
  "Walk",
  "Hike",
  "Yoga",
  "Pilates",
  "Tabata",
  "Dance",
  "Swimming",
  "Fitness Class",
  "Wellness Talk",
  "Health Check-up",
  "Social",
  "Special Event",
];

export const events = [];

// Shape used by the admin "Add event" button and by the server validator.
export const eventTemplate = {
  id: "",
  date: "",
  startTime: "07:00",
  endTime: "10:00",
  title: "",
  type: "",
  location: "",
  mapUrl: "",
  description: "",
  image: "",
  cancelled: false,
};
