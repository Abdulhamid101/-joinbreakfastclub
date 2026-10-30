import { calendarPage, events } from "../data/events.js";
import { shop } from "../data/drinks.js";
import { saturday } from "../data/content.js";

// All dates are Lagos calendar days ("YYYY-MM-DD"). Lagos is UTC+1 all
// year, so date maths is done in UTC on those strings.
const DAY = 86400000;

export function lagosToday(now = new Date()) {
  return new Date(now.getTime() + 3600000).toISOString().slice(0, 10);
}

export const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
export const toIso = (d) => d.toISOString().slice(0, 10);
export const addDays = (iso, n) => toIso(new Date(toDate(iso).getTime() + n * DAY));

export function fmtDate(iso, opts) {
  return toDate(iso).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
}

export function timeLabel(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm || "")) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function timeRange(e) {
  const a = timeLabel(e.startTime);
  const b = timeLabel(e.endTime);
  return a && b ? `${a} – ${b}` : a;
}

const byDateTime = (a, b) =>
  a.date === b.date ? (a.startTime || "").localeCompare(b.startTime || "") : a.date.localeCompare(b.date);

// Real events plus a "details soon" placeholder for any upcoming meetup
// day the owner hasn't filled in yet (skipping closed dates).
export function scheduleFrom(today = lagosToday(), weeksAhead = 10) {
  const list = events.map((e) => ({ ...e }));
  const taken = new Set(list.map((e) => e.date));
  const closed = new Set(shop.closedDates || []);

  let d = today;
  while (toDate(d).getUTCDay() !== shop.meetupWeekday) d = addDays(d, 1);
  for (let i = 0; i < weeksAhead; i++, d = addDays(d, 7)) {
    if (taken.has(d) || closed.has(d)) continue;
    list.push({
      id: `tbc-${d}`,
      placeholder: true,
      date: d,
      startTime: calendarPage.defaultStartTime,
      endTime: calendarPage.defaultEndTime,
      title: calendarPage.emptyTitle,
      type: "",
      location: calendarPage.defaultLocation || saturday.schedule?.find((r) => r.label === "Where")?.value || "",
      mapUrl: "",
      description: calendarPage.emptyBody,
      image: "",
      cancelled: false,
    });
  }
  return list.sort(byDateTime);
}

export function upcoming(today = lagosToday(), limit = 8) {
  return scheduleFrom(today).filter((e) => e.date >= today).slice(0, limit);
}

export function nextEvent(today = lagosToday()) {
  return upcoming(today, 10).find((e) => !e.cancelled) || null;
}

// ── Add to calendar ───────────────────────────────────────────────────
function utcStamp(iso, hhmm) {
  const [h, m] = (hhmm || "07:00").split(":").map(Number);
  // Lagos (UTC+1) → UTC
  const d = new Date(toDate(iso).getTime() + (h - 1) * 3600000 + m * 60000);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const endOf = (e) => e.endTime || addHours(e.startTime || "07:00", 2);
function addHours(hhmm, n) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(Math.min(23, h + n)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const title = (e) => `Breakfast Club: ${e.title}`;

export function googleCalendarUrl(e) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: title(e),
    dates: `${utcStamp(e.date, e.startTime)}/${utcStamp(e.date, endOf(e))}`,
    location: e.location || "",
    details: `${e.description || ""}\n\nhttps://joinbreakfastclub.world/calendar`.trim(),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

const icsEscape = (s = "") => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

export function downloadIcs(e) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Breakfast Club//Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@joinbreakfastclub.world`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${utcStamp(e.date, e.startTime)}`,
    `DTEND:${utcStamp(e.date, endOf(e))}`,
    `SUMMARY:${icsEscape(title(e))}`,
    `LOCATION:${icsEscape(e.location)}`,
    `DESCRIPTION:${icsEscape(e.description)}`,
    "URL:https://joinbreakfastclub.world/calendar",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `breakfast-club-${e.date}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function directionsUrl(e) {
  if (e.mapUrl) return e.mapUrl;
  if (!e.location) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}`;
}
