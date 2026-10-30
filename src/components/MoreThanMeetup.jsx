import { moreThanMeetup } from "../data/content";
import "./MoreThanMeetup.css";

export default function MoreThanMeetup() {
  return (
    <section id="community" className="more section">
      <div className="section__inner more__grid">
        <div className="more__copy">
          <p className="eyebrow" data-reveal>{moreThanMeetup.eyebrow}</p>
          <h2 className="more__heading" data-reveal style={{ "--d": 1 }}>
            {moreThanMeetup.heading}
          </h2>
          <p className="more__body" data-reveal style={{ "--d": 2 }}>
            {moreThanMeetup.body}
          </p>
        </div>
        <div className="more__panel" data-reveal style={{ "--d": 1 }}>
          <ul className="more__list">
            {moreThanMeetup.initiatives.map((item, i) => (
              <li key={`${i}-${item}`}>
                <span className="more__idx">{String(i + 1).padStart(2, "0")}</span>
                {item}
                <span className="more__arrow" aria-hidden="true">↗</span>
              </li>
            ))}
          </ul>
          <p className="more__closing">{moreThanMeetup.closing}</p>
        </div>
      </div>
    </section>
  );
}
