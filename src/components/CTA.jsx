import { cta, site } from "../data/content";
import "./CTA.css";

export default function CTA() {
  return (
    <section id="join" className="cta section">
      <div className="section__inner cta__inner">
        <h2 className="cta__heading" data-reveal>{cta.heading}</h2>
        <p className="cta__body" data-reveal style={{ "--d": 1 }}>
          {cta.body}
        </p>
        <div className="cta__actions" data-reveal style={{ "--d": 2 }}>
          <a className="btn btn--dark cta__btn" href={`mailto:${site.email}`}>
            {cta.ctaLabel} <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a className="cta__ig" href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
            {site.instagramHandle}
          </a>
        </div>
      </div>
      <div className="cta__sun" aria-hidden="true" />
    </section>
  );
}
