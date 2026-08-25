import { timeline } from "../data/content";
import "./MorningTimeline.css";

export default function MorningTimeline() {
  return (
    <section className="timeline section">
      <div className="section__inner">
        <p className="eyebrow">The morning is sacred</p>
        <h2 className="timeline__heading">One road, three hours.</h2>
        <div className="timeline__track">
          {timeline.map((stop, i) => (
            <div className="timeline__stop" key={stop.time}>
              <div className="timeline__marker">
                <span className="timeline__time">{stop.time}</span>
              </div>
              <h3 className="timeline__label">{stop.label}</h3>
              <p className="timeline__body">{stop.body}</p>
              {i < timeline.length - 1 && (
                <span className="timeline__connector" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
