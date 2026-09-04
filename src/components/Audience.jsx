import { audience } from "../data/content";
import "./Audience.css";

const portraits = [1, 2, 3, 4].map((n) => `/images/audience/member-${n}.jpg`);

export default function Audience() {
  return (
    <section className="audience section">
      <div className="section__inner">
        <p className="eyebrow">{audience.eyebrow}</p>
        <h2 className="audience__heading">{audience.heading}</h2>
        <p className="audience__body measure">{audience.body}</p>
        <div className="audience__grid">
          {portraits.map((src) => (
            <PortraitFrame key={src} src={src} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PortraitFrame({ src }) {
  return (
    <div className="portrait-frame">
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
