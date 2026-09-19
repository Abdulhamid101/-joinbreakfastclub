import { shop } from "../data/drinks.js";

// Lagos is UTC+1 all year (no daylight saving), so we can work in "Lagos
// wall-clock" by shifting UTC by one hour and using the getUTC* methods.
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const toLagos = (date) => new Date(date.getTime() + LAGOS_OFFSET_MS);
const isoDay = (d) => d.toISOString().slice(0, 10);

// The next meetup this order can make, given the weekly cut-off.
// Returns { date: "YYYY-MM-DD", label, cutoffLabel }.
export function nextPickup(now = new Date()) {
  const lagosNow = toLagos(now);
  const today = new Date(
    Date.UTC(lagosNow.getUTCFullYear(), lagosNow.getUTCMonth(), lagosNow.getUTCDate())
  );

  for (let i = 0; i < 70; i++) {
    const day = new Date(today.getTime() + i * DAY_MS);
    if (day.getUTCDay() !== shop.meetupWeekday) continue;
    if (shop.closedDates.includes(isoDay(day))) continue;

    const cutoff = new Date(
      day.getTime() - shop.cutoffDaysBefore * DAY_MS + shop.cutoffHour * 60 * 60 * 1000
    );
    if (lagosNow.getTime() >= cutoff.getTime()) continue;

    return {
      date: isoDay(day),
      label: fmt(day, { weekday: "long", day: "numeric", month: "long" }),
      shortLabel: fmt(day, { weekday: "short", day: "numeric", month: "short" }),
      cutoffLabel: `${fmt(cutoff, { weekday: "short" })} ${hourLabel(shop.cutoffHour)}`,
    };
  }
  return null;
}

function fmt(date, opts) {
  return date.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

function hourLabel(h) {
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
}
