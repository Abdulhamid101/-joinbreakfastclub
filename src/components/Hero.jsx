import { hero, site } from "../data/content";
import { fmtDate, nextEvent, timeLabel } from "../lib/calendar";
import Arcs from "./Arcs";
import "./Hero.css";

// Photos sit in arch-shaped frames — the brand's arc motif. Swap the files
// in public/images/audience/ for real community shots any time.
const PHOTOS = ["/images/audience/member-3.jpg", "/images/audience/member-1.jpg", "/images/audience/member-4.jpg"];

export default function Hero() {
  const next = nextEvent();
  const badge = `${site.tagline} • ${site.name} • `.toUpperCase();

  return (
    <section id="top" className="hero on-dark">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow hero__in" style={{ "--d": 0 }}>
            {hero.eyebrow}
          </p>

          <h1 className="hero__heading hero__in" style={{ "--d": 1 }}>
            {hero.headingLines.map((line, i) => (
              <span className="hero__line" key={`${i}-${line}`}>
                {i === hero.headingAccentLine ? (
                  <span className="hero__accent">
                    {line}
                    <svg className="hero__swoosh" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M3 15 C 70 4, 160 3, 297 11" />
                    </svg>
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="hero__sub hero__in" style={{ "--d": 2 }}>
            {hero.sub}
          </p>

          <div className="hero__actions hero__in" style={{ "--d": 3 }}>
            <a className="btn" href={site.waitlistUrl}>
              {hero.primaryCta} <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn btn--outline" href="#why-we-exist">
              {hero.secondaryCta}
            </a>
          </div>

          <p className="hero__note hero__in" style={{ "--d": 4 }}>
            <span className="hero__pulse" aria-hidden="true" />
            <strong>{hero.note.strong}</strong>
            {hero.note.rest.map((item) => (
              <span key={item}>· {item}</span>
            ))}
          </p>
        </div>

        <div className="hero__art" aria-hidden="true">
          {PHOTOS.map((src, i) => (
            <div className={`hero__arch hero__arch--${i + 1}`} key={src}>
              <img
                src={src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              />
            </div>
          ))}

          <svg className="hero__badge" viewBox="0 0 200 200">
            <defs>
              <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <circle cx="100" cy="100" r="99" />
            <text>
              <textPath href="#badge-circle" textLength="488">
                {badge}
              </textPath>
            </text>
            <g className="hero__badge-mark">
              <ellipse cx="94" cy="100" rx="22" ry="15" />
              <ellipse cx="106" cy="104" rx="22" ry="15" />
            </g>
          </svg>
        </div>

        {next && (
          <a className="hero__event" href="/calendar">
            <span className="hero__event-date">
              <small>{fmtDate(next.date, { month: "short" })}</small>
              <strong>{fmtDate(next.date, { day: "numeric" })}</strong>
            </span>
            <span className="hero__event-text">
              <small>Next up · {fmtDate(next.date, { weekday: "long" })}</small>
              <strong>{next.title}</strong>
              <span>{[next.type, timeLabel(next.startTime)].filter(Boolean).join(" · ")}</span>
            </span>
            <span className="hero__event-go" aria-hidden="true">→</span>
          </a>
        )}
      </div>
      <Arcs />
    </section>
  );
}
