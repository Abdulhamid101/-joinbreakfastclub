import { cta } from "../data/content";
import "./CTA.css";

export default function CTA() {
  return (
    <section id="join" className="cta section">
      <div className="section__inner cta__inner">
        <h2 className="cta__heading">{cta.heading}</h2>
        <p className="cta__body measure">{cta.body}</p>
        <a className="btn btn--light" href="mailto:hello@joinbreakfastclub.com">
          {cta.ctaLabel}
        </a>
      </div>
    </section>
  );
}
