import { useState } from "react";
import {
  footerCta,
  footerColumns,
  newsletter,
  footerBottom,
} from "../data/content";
import "./Footer.css";

export default function Footer() {
  const [logoFound, setLogoFound] = useState(true);
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Thanks — we'll be in touch at ${email}`);
    setEmail("");
  }

  return (
    <footer className="footer">
      <div className="footer__cta section">
        <div className="section__inner footer__cta-inner">
          {logoFound && (
            <img
              className="footer__logo"
              src="/images/logo.svg"
              alt="Breakfast Club"
              onError={() => setLogoFound(false)}
            />
          )}
          <h2 className="footer__heading">{footerCta.heading}</h2>
          <p className="footer__tagline">{footerCta.tagline}</p>
          <a className="btn btn--light" href="#join">
            {footerCta.ctaLabel}
          </a>
        </div>
      </div>

      <div className="footer__links section__inner">
        {footerColumns.map((col) => (
          <div className="footer__col" key={col.title}>
            <h3 className="footer__col-title">{col.title}</h3>
            <ul className="footer__col-list">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__newsletter">
        <div className="section__inner footer__newsletter-inner">
          <h3 className="footer__newsletter-heading">{newsletter.heading}</h3>
          <p className="footer__newsletter-body">{newsletter.body}</p>
          <form className="footer__newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder={newsletter.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn">
              {newsletter.ctaLabel}
            </button>
          </form>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="section__inner footer__bottom-inner">
          <div className="footer__bottom-row">
            <span>
              {footerBottom.copyright} · {footerBottom.location}
            </span>
            <nav className="footer__legal">
              {footerBottom.legalLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="footer__socials">
              <a href="https://instagram.com" aria-label="Instagram">
                <CircleIcon />
              </a>
              <a href="https://tiktok.com" aria-label="TikTok">
                <CircleIcon />
              </a>
              <a href="mailto:hello@breakfastclubcommunity.com" aria-label="Email">
                <CircleIcon />
              </a>
            </div>
          </div>
          <p className="footer__final-line">{footerBottom.tagline}</p>
        </div>
      </div>
    </footer>
  );
}

function CircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
