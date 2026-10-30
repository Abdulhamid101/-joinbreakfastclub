import { saturday } from "../data/content";
import { fmtDate, nextEvent, timeLabel } from "../lib/calendar";
import "./Saturday.css";

export default function Saturday() {
  const next = nextEvent();

  return (
    <section id="saturday" className="saturday">
      <div className="section__inner saturday__grid">
        <div>
          <p className="eyebrow eyebrow--light">{saturday.eyebrow}</p>
          <h2 className="saturday__heading">{saturday.heading}</h2>
          <p className="saturday__body measure">{saturday.body}</p>
          <a className="btn btn--dark" href="/calendar">
            {saturday.ctaLabel}
          </a>
        </div>

        <div className="saturday__card">
          {next && (
            <a className="saturday__next" href="/calendar">
              <span className="saturday__next-date">
                <span>{fmtDate(next.date, { month: "short" })}</span>
                <strong>{fmtDate(next.date, { day: "numeric" })}</strong>
              </span>
              <span className="saturday__next-text">
                <small>Next up · {fmtDate(next.date, { weekday: "long" })}</small>
                <strong>{next.title}</strong>
                <span>
                  {[next.type, timeLabel(next.startTime), next.placeholder ? "details soon" : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="saturday__next-arrow" aria-hidden="true">→</span>
            </a>
          )}
          {saturday.schedule.map((row) => (
            <div className="saturday__row" key={row.label}>
              <strong>{row.label}</strong>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
