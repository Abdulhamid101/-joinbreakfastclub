import { vision } from "../data/content";
import "./Vision.css";

export default function Vision() {
  return (
    <section className="vision section">
      <div className="section__inner">
        <p className="eyebrow eyebrow--onDark">{vision.eyebrow}</p>
        <h2 className="vision__heading">{vision.heading}</h2>
        <p className="vision__intro measure">{vision.intro}</p>
        <ul className="vision__lines">
          {vision.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="vision__closing script">{vision.closing}</p>
      </div>
    </section>
  );
}
