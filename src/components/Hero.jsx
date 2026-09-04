import { useState } from "react";
import { hero, site } from "../data/content";
import Arcs from "./Arcs";
import "./Hero.css";

export default function Hero() {
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

        <h1 className="hero__heading">
          {hero.headingLines.map((line, i) => (
            <span key={line}>
              {i === hero.headingAccentLine ? (
                <span className="hero__heading-accent">{line}</span>
              ) : (
                line
              )}
              {i < hero.headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="hero__sub measure">{hero.sub}</p>

        <div className="hero__actions">
          <a className="btn" href={site.waitlistUrl}>
            {hero.primaryCta}
          </a>
          <a className="btn btn--outline" href="#why-we-exist">
            {hero.secondaryCta}
          </a>
        </div>

        <div className="hero__note">
          <strong>{hero.note.strong}</strong>
          {hero.note.rest.map((item) => (
            <span key={item}>
              <span aria-hidden="true">·</span> {item}
            </span>
          ))}
        </div>
      </div>
      <Arcs />
    </section>
  );
}