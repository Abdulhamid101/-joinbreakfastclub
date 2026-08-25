import { useState } from "react";
import { hero, site } from "../data/content";
import "./Hero.css";

export default function Hero() {
  // Drop the cover photo at public/images/hero/cover.jpg and it appears
  // automatically. Until then, the gradient + horizon line carries the
  // section on their own, so there's no broken-image state to fix later.
  const [imageFound, setImageFound] = useState(true);

  return (
    <section id="top" className="hero">
      {imageFound && (
        <img
          className="hero__media"
          src="/images/hero/cover.jpg"
          alt=""
          aria-hidden="true"
          onError={() => setImageFound(false)}
        />
      )}
      <div className="hero__inner">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 className="hero__heading">{hero.heading}</h1>
        <p className="hero__sub measure">{hero.sub}</p>
        <a className="btn" href={site.waitlistUrl}>
          {hero.ctaLabel}
        </a>
      </div>
    </section>
  );
}
