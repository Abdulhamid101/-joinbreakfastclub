import { vision } from "../data/content";
import "./Vision.css";

export default function Vision() {
  return (
    <section id="vision" className="vision section on-dark">
      <div className="section__inner">
        <div className="vision__head">
          <p className="eyebrow" data-reveal>{vision.eyebrow}</p>
          <h2 className="vision__heading" data-reveal style={{ "--d": 1 }}>
            {vision.heading}
          </h2>
          <p className="vision__intro" data-reveal style={{ "--d": 2 }}>
            {vision.intro}
          </p>
        </div>
        <ul className="vision__lines">
          {vision.lines.map((line, i) => (
            <li key={`${i}-${line}`} data-reveal>
              <span className="vision__mark" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
        <p className="vision__closing script" data-reveal>
          {vision.closing}
        </p>
      </div>
    </section>
  );
}
