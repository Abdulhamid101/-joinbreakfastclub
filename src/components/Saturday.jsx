import { saturday, site } from "../data/content";
import "./Saturday.css";

export default function Saturday() {
  return (
    <section className="saturday">
      <div className="section__inner saturday__grid">
        <div>
          <p className="eyebrow eyebrow--light">{saturday.eyebrow}</p>
          <h2 className="saturday__heading">{saturday.heading}</h2>
          <p className="saturday__body measure">{saturday.body}</p>
          <a className="btn btn--dark" href={site.waitlistUrl}>
            {saturday.ctaLabel}
          </a>
        </div>

        <div className="saturday__card">
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
