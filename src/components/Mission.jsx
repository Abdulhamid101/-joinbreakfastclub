import { mission } from "../data/content";
import "./Mission.css";

export default function Mission() {
  return (
    <section id="why-we-exist" className="mission section">
      <div className="section__inner mission__grid">
        <div>
          <p className="eyebrow">{mission.eyebrow}</p>
          <h2 className="mission__heading">{mission.heading}</h2>
        </div>
        <p className="mission__body measure">{mission.body}</p>
      </div>
    </section>
  );
}
