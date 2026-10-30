// Calendar editor — the part of the admin the owner will use every week.
import { useMemo, useState } from "react";
import { eventTemplate, eventTypes } from "../data/events";
import { addDays, fmtDate, lagosToday, timeRange, toDate } from "../lib/calendar";
import { ImageField, slugify } from "./FieldEditor";

const newId = (date, title) => `${date}-${slugify(title) || "event"}`.slice(0, 60);

export default function EventsEditor({ events, onChange, calendarPage, meetupWeekday }) {
  const today = lagosToday();
  const [openId, setOpenId] = useState(null);
  const [showPast, setShowPast] = useState(false);

  const sorted = useMemo(
    () =>
      events
        .map((e, index) => ({ e, index }))
        .sort((a, b) => a.e.date.localeCompare(b.e.date) || a.e.startTime.localeCompare(b.e.startTime)),
    [events]
  );
  const upcoming = sorted.filter(({ e }) => !e.date || e.date >= today);
  const past = sorted.filter(({ e }) => e.date && e.date < today).reverse();

  function nextFreeMeetup() {
    const taken = new Set(events.map((e) => e.date));
    let d = today;
    while (toDate(d).getUTCDay() !== meetupWeekday) d = addDays(d, 1);
    while (taken.has(d)) d = addDays(d, 7);
    return d;
  }

  function add() {
    const date = nextFreeMeetup();
    const e = {
      ...eventTemplate,
      date,
      startTime: calendarPage.defaultStartTime || "07:00",
      endTime: calendarPage.defaultEndTime || "10:00",
      location: calendarPage.defaultLocation || "",
      id: newId(date, "new"),
    };
    while (events.some((x) => x.id === e.id)) e.id = `${e.id}-x`.slice(0, 60);
    onChange([...events, e]);
    setOpenId(e.id);
  }

  function update(index, patch) {
    onChange(events.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function remove(index) {
    if (!window.confirm("Delete this event?")) return;
    onChange(events.filter((_, i) => i !== index));
  }

  function duplicateNextWeek(index) {
    const src = events[index];
    const taken = new Set(events.map((e) => e.date));
    let date = addDays(src.date, 7);
    while (taken.has(date)) date = addDays(date, 7);
    const copy = { ...src, date, cancelled: false, id: newId(date, src.title) };
    if (events.some((e) => e.id === copy.id)) copy.id = `${copy.id}-2`.slice(0, 60);
    onChange([...events, copy]);
    setOpenId(copy.id);
  }

  const renderRow = ({ e, index }) => (
    <EventRow
      key={`${e.id}-${index}`}
      event={e}
      open={openId === e.id}
      onToggle={() => setOpenId(openId === e.id ? null : e.id)}
      onChange={(patch) => update(index, patch)}
      onRemove={() => remove(index)}
      onRepeat={() => duplicateNextWeek(index)}
      meetupWeekday={meetupWeekday}
    />
  );

  return (
    <div className="ae">
      <div className="ae__bar">
        <div>
          <h2 className="ae__title">Events</h2>
          <p className="af-hint">
            Saturdays without an event show “{calendarPage.emptyTitle} — details coming soon” automatically.
          </p>
        </div>
        <button type="button" className="ab ab--primary" onClick={add}>
          + Add event
        </button>
      </div>

      {upcoming.length === 0 && (
        <div className="ae__empty">
          <strong>No upcoming events yet.</strong>
          <span>Tap “Add event” to put this Saturday's activity on the calendar.</span>
        </div>
      )}
      <div className="ae__list">{upcoming.map(renderRow)}</div>

      {past.length > 0 && (
        <div className="ae__past">
          <button type="button" className="ab ab--ghost ab--sm" onClick={() => setShowPast(!showPast)}>
            {showPast ? "Hide" : "Show"} past events ({past.length})
          </button>
          {showPast && <div className="ae__list">{past.map(renderRow)}</div>}
        </div>
      )}
    </div>
  );
}

function EventRow({ event: e, open, onToggle, onChange, onRemove, onRepeat, meetupWeekday }) {
  const set = (k) => (ev) => onChange({ [k]: ev.target.type === "checkbox" ? ev.target.checked : ev.target.value });
  const wrongDay = e.date && toDate(e.date).getUTCDay() !== meetupWeekday;
  const missing = !e.title.trim();

  return (
    <div className="ae-row" data-open={open || undefined} data-cancelled={e.cancelled || undefined}>
      <button type="button" className="ae-row__head" onClick={onToggle} aria-expanded={open}>
        <span className="ae-row__date">
          {e.date ? (
            <>
              <span>{fmtDate(e.date, { weekday: "short" })}</span>
              <strong>{fmtDate(e.date, { day: "numeric" })}</strong>
              <span>{fmtDate(e.date, { month: "short" })}</span>
            </>
          ) : (
            <strong>?</strong>
          )}
        </span>
        <span className="ae-row__text">
          <strong>{e.title || "Untitled event"}</strong>
          <span>
            {[e.type, timeRange(e), e.location].filter(Boolean).join(" · ") || "Add details"}
          </span>
        </span>
        {e.cancelled && <em className="af-pill af-pill--warn">Cancelled</em>}
        {missing && <em className="af-pill af-pill--warn">Needs a title</em>}
        <span className="ae-row__chev" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className="ae-row__body">
          <div className="ae-grid">
            <div className="af-field ae-grid__wide">
              <label className="af-label" htmlFor={`${e.id}-title`}>Title</label>
              <input id={`${e.id}-title`} value={e.title} onChange={set("title")} placeholder="e.g. Sunrise hike at Olumo Rock" maxLength={120} />
            </div>
            <div className="af-field">
              <label className="af-label" htmlFor={`${e.id}-type`}>Activity</label>
              <input id={`${e.id}-type`} list="bc-event-types" value={e.type} onChange={set("type")} placeholder="Run, Yoga, Hike…" maxLength={40} />
              <datalist id="bc-event-types">
                {eventTypes.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="af-field">
              <label className="af-label" htmlFor={`${e.id}-date`}>Date</label>
              <input id={`${e.id}-date`} type="date" value={e.date} onChange={set("date")} required />
              {wrongDay && <p className="af-hint af-hint--warn">Heads up: this isn't the usual meetup day.</p>}
            </div>
            <div className="af-field">
              <label className="af-label" htmlFor={`${e.id}-start`}>Starts</label>
              <input id={`${e.id}-start`} type="time" value={e.startTime} onChange={set("startTime")} />
            </div>
            <div className="af-field">
              <label className="af-label" htmlFor={`${e.id}-end`}>Ends</label>
              <input id={`${e.id}-end`} type="time" value={e.endTime} onChange={set("endTime")} />
            </div>
            <div className="af-field ae-grid__wide">
              <label className="af-label" htmlFor={`${e.id}-loc`}>Location</label>
              <input id={`${e.id}-loc`} value={e.location} onChange={set("location")} placeholder="e.g. MKO Abiola Stadium, Kuto, Abeokuta" maxLength={200} />
            </div>
            <div className="af-field ae-grid__wide">
              <label className="af-label" htmlFor={`${e.id}-map`}>Google Maps link (optional)</label>
              <input id={`${e.id}-map`} type="url" value={e.mapUrl} onChange={set("mapUrl")} placeholder="https://maps.app.goo.gl/…" />
              <p className="af-hint">Leave blank and the Directions button searches the location instead.</p>
            </div>
            <div className="af-field ae-grid__wide">
              <label className="af-label" htmlFor={`${e.id}-desc`}>Description</label>
              <textarea id={`${e.id}-desc`} rows={4} value={e.description} onChange={set("description")} placeholder="What to expect, what to bring, the breakfast menu…" maxLength={2000} />
            </div>
            <div className="ae-grid__wide">
              <ImageField id={`${e.id}-img`} title="Flyer / photo (optional)" value={e.image} onChange={(url) => onChange({ image: url })} />
            </div>
          </div>

          <div className="ae-row__foot">
            <label className="af-switch">
              <input type="checkbox" checked={e.cancelled} onChange={set("cancelled")} />
              <span className="af-switch__track" aria-hidden="true" />
              <span>Cancelled</span>
            </label>
            <span className="ae-row__actions">
              <button type="button" className="ab ab--soft ab--sm" onClick={onRepeat}>
                Repeat next week
              </button>
              <button type="button" className="ab ab--danger ab--sm" onClick={onRemove}>
                Delete
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
