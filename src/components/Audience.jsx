import { audience } from "../data/content";
import "./Audience.css";

const portraits = [1, 2, 3, 4].map((n) => `/images/audience/member-${n}.jpg`);

export default function Audience() {
  return (
    <section id="audience" className="audience section">
      <div className="section__inner audience__grid">
        <div className="audience__copy">
          <p className="eyebrow" data-reveal>{audience.eyebrow}</p>
          <h2 className="audience__heading" data-reveal style={{ "--d": 1 }}>
            {audience.heading}
          </h2>
          <p className="audience__body" data-reveal style={{ "--d": 2 }}>
            {audience.body}
          </p>
        </div>
        <div className="audience__mosaic">
          {portraits.map((src, i) => (
            <div className={`audience__photo audience__photo--${i + 1}`} key={src} data-reveal style={{ "--d": i }}>
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
