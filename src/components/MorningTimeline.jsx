import { timeline, timelineSection } from "../data/content";
import "./MorningTimeline.css";

export default function MorningTimeline() {
  return (
    <section className="timeline section on-dark">
      <div className="section__inner">
        <div className="sec-head timeline__head">
          <p className="eyebrow" data-reveal>{timelineSection.eyebrow}</p>
          <h2 data-reveal style={{ "--d": 1 }}>{timelineSection.heading}</h2>
        </div>
        <ol className="timeline__track">
          {timeline.map((stop, i) => (
            <li className="timeline__stop" key={`${i}-${stop.label}`} data-reveal style={{ "--d": i }}>
              <span className="timeline__num">{stop.time}</span>
              <h3 className="timeline__label">{stop.label}</h3>
              <p className="timeline__body">{stop.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
