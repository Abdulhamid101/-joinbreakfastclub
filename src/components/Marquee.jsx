import { experienceCategories } from "../data/content";
import "./Marquee.css";

// Scrolling ticker of every activity listed under "Our experiences" —
// edit those tags in the admin and this updates too.
export default function Marquee() {
  const items = [...new Set(experienceCategories.flatMap((c) => c.tags))];
  if (!items.length) return null;
  const row = (hidden) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}>
          {t}
          <span className="marquee__star" aria-hidden="true">✺</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="region" aria-label="Activities">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
