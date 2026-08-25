import { site } from "../data/content";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__mark" href="#top">
          {site.name}
        </a>
        <a className="header__cta" href={site.waitlistUrl}>
          Join
        </a>
      </div>
    </header>
  );
}
