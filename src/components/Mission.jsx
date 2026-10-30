import { mission } from "../data/content";
import "./Mission.css";

export default function Mission() {
  return (
    <section id="why-we-exist" className="mission section">
      <div className="section__inner mission__grid">
        <div className="mission__media" data-reveal>
          <div className="mission__arch">
            <img
              src="/images/audience/member-1.jpg"
              alt=""
              loading="lazy"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            />
          </div>
          <div className="mission__stamp" aria-hidden="true">
            <span className="script">Every</span>
            <strong>Saturday</strong>
          </div>
        </div>
        <div className="mission__copy">
          <p className="eyebrow" data-reveal>{mission.eyebrow}</p>
          <h2 className="mission__heading" data-reveal style={{ "--d": 1 }}>
            {mission.heading}
          </h2>
          <p className="mission__body" data-reveal style={{ "--d": 2 }}>
            {mission.body}
          </p>
        </div>
      </div>
    </section>
  );
}
