import { values, valuesSection } from "../data/content";
import "./Values.css";

// Simple line icons for the first three cards (Move, Eat, Connect).
const ICONS = [
  <path key="m" d="M14 5.5a2 2 0 1 0 0-.01M9 20l3-6 3 2v5M7 11l3-3 4 1 2 3h3M12 14l-3-2" />,
  <path key="e" d="M3 11h18a9 9 0 0 1-18 0ZM8 7c0-1.5 1-2 1-3.5M12 7c0-1.5 1-2 1-3.5M16 7c0-1.5 1-2 1-3.5" />,
  <path key="c" d="M9 12a5 5 0 1 1 0 .01M15 12a5 5 0 1 1 0 .01" />,
];

export default function Values() {
  return (
    <section className="values section">
      <div className="section__inner">
        <div className="sec-head">
          <p className="eyebrow" data-reveal>{valuesSection.eyebrow}</p>
          <h2 data-reveal style={{ "--d": 1 }}>{valuesSection.heading}</h2>
        </div>
        <ol className="values__grid">
          {values.map((value, i) => (
            <li className={`values__card values__card--${(i % 3) + 1}`} key={`${i}-${value.title}`} data-reveal style={{ "--d": i }}>
              <span className="values__num">{String(i + 1).padStart(2, "0")}</span>
              <svg className="values__icon" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS[i % 3]}
              </svg>
              <h3 className="values__title">{value.title}</h3>
              <p className="values__body">{value.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
