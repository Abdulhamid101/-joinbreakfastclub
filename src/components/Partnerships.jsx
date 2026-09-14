import { partnerships, site } from "../data/content";
import "./Partnerships.css";

export default function Partnerships() {
  return (
    <section id="partnerships" className="partnerships section">
      <div className="section__inner partnerships__grid">
        <div>
          <p className="eyebrow">{partnerships.eyebrow}</p>
          <h2 className="partnerships__heading">{partnerships.heading}</h2>
        </div>
        <div>
          <p className="partnerships__body measure">{partnerships.body}</p>
          <a className="btn btn--dark" href={`mailto:${site.email}`}>
            {partnerships.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
