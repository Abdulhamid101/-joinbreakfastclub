import { useEffect, useMemo, useState } from "react";
import { calendarPage } from "../data/events";
import { shop } from "../data/drinks";
import {
  addDays,
  directionsUrl,
  downloadIcs,
  fmtDate,
  googleCalendarUrl,
  lagosToday,
  scheduleFrom,
  timeRange,
  toDate,
} from "../lib/calendar";
import "./CalendarPage.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const today = lagosToday();
  const all = useMemo(() => scheduleFrom(today, 12), [today]);
  const coming = all.filter((e) => e.date >= today);
  const firstUp = coming.find((e) => !e.cancelled) || coming[0] || null;

  const [selectedId, setSelectedId] = useState(firstUp?.id || null);
  const [month, setMonth] = useState(() => (firstUp?.date || today).slice(0, 7));

  useEffect(() => {
    document.title = "Calendar — What's On Every Saturday | Breakfast Club";
  }, []);

  const selected = all.find((e) => e.id === selectedId) || firstUp;
  const select = (e) => {
    setSelectedId(e.id);
    setMonth(e.date.slice(0, 7));
  };

  return (
    <>
      <section className="cal-hero section">
        <div className="section__inner">
          <p className="eyebrow">{calendarPage.eyebrow}</p>
          <h1 className="cal-hero__heading">{calendarPage.heading}</h1>
          <p className="cal-hero__sub measure">{calendarPage.sub}</p>
        </div>
      </section>

      <section className="cal section" aria-label="Event calendar">
        <div className="section__inner cal__layout">
          {selected && (
            <EventFeature
              event={selected}
              isNext={selected.id === firstUp?.id}
              isPast={selected.date < today}
            />
          )}

          <div className="cal__side">
            <MonthGrid
              month={month}
              setMonth={setMonth}
              events={all}
              today={today}
              selectedDate={selected?.date}
              onPick={select}
            />

            <div className="cal-list">
              <h2 className="cal-list__heading">Coming up</h2>
              <ol className="cal-list__items">
                {coming.slice(0, 8).map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="cal-list__item"
                      aria-current={e.id === selected?.id ? "true" : undefined}
                      data-cancelled={e.cancelled || undefined}
                      onClick={() => select(e)}
                    >
                      <span className="cal-list__date">
                        <span>{fmtDate(e.date, { month: "short" })}</span>
                        <strong>{fmtDate(e.date, { day: "numeric" })}</strong>
                      </span>
                      <span className="cal-list__text">
                        <strong>{e.title}</strong>
                        <span>
                          {e.cancelled
                            ? "Cancelled"
                            : e.placeholder
                              ? "Details coming soon"
                              : [e.type, timeRange(e)].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function EventFeature({ event: e, isNext, isPast }) {
  const directions = directionsUrl(e);
  const label = isPast ? "Past event" : isNext ? "Next up" : "Coming up";

  return (
    <article className="cal-feature" data-cancelled={e.cancelled || undefined} aria-live="polite">
      <div className="cal-feature__media">
        {e.image ? (
          <img src={e.image} alt={`${e.title} flyer`} loading="lazy" />
        ) : (
          <div className="cal-feature__art" aria-hidden="true">
            <span className="cal-feature__art-day">{fmtDate(e.date, { weekday: "long" })}</span>
            <span className="cal-feature__art-num">{fmtDate(e.date, { day: "numeric" })}</span>
            <span className="cal-feature__art-month">{fmtDate(e.date, { month: "long" })}</span>
          </div>
        )}
      </div>

      <div className="cal-feature__body">
        <p className="cal-feature__label">
          <span className="cal-feature__dot" aria-hidden="true" />
          {label}
          {e.type && <span className="cal-chip">{e.type}</span>}
        </p>
        <h2 className="cal-feature__title">{e.title}</h2>
        {e.cancelled && <p className="cal-feature__cancelled">This event has been cancelled.</p>}

        <dl className="cal-feature__facts">
          <div>
            <dt>Date</dt>
            <dd>{fmtDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</dd>
          </div>
          {timeRange(e) && (
            <div>
              <dt>Time</dt>
              <dd>{timeRange(e)}</dd>
            </div>
          )}
          {e.location && (
            <div>
              <dt>Where</dt>
              <dd>{e.location}</dd>
            </div>
          )}
        </dl>

        {e.description && <p className="cal-feature__desc">{e.description}</p>}

        {!isPast && !e.cancelled && (
          <div className="cal-feature__actions">
            <a className="btn" href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">
              Add to Google Calendar
            </a>
            <button type="button" className="btn btn--outline-dark" onClick={() => downloadIcs(e)}>
              Apple / Outlook
            </button>
            {directions && (
              <a className="btn btn--outline-dark" href={directions} target="_blank" rel="noopener noreferrer">
                Directions
              </a>
            )}
          </div>
        )}
        {!isPast && !e.cancelled && toDate(e.date).getUTCDay() === shop.meetupWeekday && (
          <a className="cal-feature__drinks" href="/drinks">
            Pre-order your drinks for this morning →
          </a>
        )}
      </div>
    </article>
  );
}

function MonthGrid({ month, setMonth, events, today, selectedDate, onPick }) {
  const first = `${month}-01`;
  const lead = (toDate(first).getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
  const byDate = useMemo(() => {
    const m = new Map();
    for (const e of events) if (!m.has(e.date)) m.set(e.date, e);
    return m;
  }, [events]);

  const shift = (n) => {
    const d = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7) - 1 + n, 1));
    setMonth(d.toISOString().slice(0, 7));
  };

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(addDays(first, d - 1));

  return (
    <div className="cal-month">
      <div className="cal-month__bar">
        <button type="button" className="cal-month__nav" onClick={() => shift(-1)} aria-label="Previous month">
          ‹
        </button>
        <h2 className="cal-month__title">{fmtDate(first, { month: "long", year: "numeric" })}</h2>
        <button type="button" className="cal-month__nav" onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal-month__grid" role="grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal-month__wd" role="columnheader">
            {w}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`x${i}`} />;
          const e = byDate.get(iso);
          const cls = [
            "cal-day",
            iso === today && "is-today",
            iso < today && "is-past",
            e && "has-event",
            e?.placeholder && "is-tbc",
            e?.cancelled && "is-cancelled",
            iso === selectedDate && "is-selected",
          ]
            .filter(Boolean)
            .join(" ");
          const num = Number(iso.slice(8));
          return e ? (
            <button
              key={iso}
              type="button"
              className={cls}
              onClick={() => onPick(e)}
              aria-label={`${fmtDate(iso, { weekday: "long", day: "numeric", month: "long" })}: ${e.title}`}
            >
              {num}
            </button>
          ) : (
            <span key={iso} className={cls}>
              {num}
            </span>
          );
        })}
      </div>
      <p className="cal-month__key">
        <span className="cal-key cal-key--event" /> Event
        <span className="cal-key cal-key--tbc" /> Details soon
      </p>
    </div>
  );
}
