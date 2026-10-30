import { partnerships, site } from "../data/content";
import "./Partnerships.css";

export default function Partnerships() {
  return (
    <section id="partnerships" className="partnerships section">
      <div className="section__inner">
        <div className="partnerships__card" data-reveal>
          <div className="partnerships__copy">
            <p className="eyebrow">{partnerships.eyebrow}</p>
            <h2 className="partnerships__heading">{partnerships.heading}</h2>
          </div>
          <div className="partnerships__side">
            <p className="partnerships__body">{partnerships.body}</p>
            <a className="btn btn--dark" href={`mailto:${site.email}`}>
              {partnerships.ctaLabel} <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="partnerships__rings" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
