import { useState } from "react";
import { footerCta, footerColumns, newsletter, footerBottom, site } from "../data/content";
import "./Footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // No newsletter service is wired up yet — this opens the visitor's mail
    // app addressed to the community inbox so signups still reach someone.
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      "Newsletter signup"
    )}&body=${encodeURIComponent(`Please add me to the list: ${email}`)}`;
    setEmail("");
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__cta">
            <h2 className="footer__heading">{footerCta.heading}</h2>
            <p className="footer__tagline">{footerCta.tagline}</p>
            <a className="btn" href="/#join">
              {footerCta.ctaLabel} <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
          </div>

          <div className="footer__news">
            <h3 className="footer__news-heading">{newsletter.heading}</h3>
            <p className="footer__news-body">{newsletter.body}</p>
            <form className="footer__form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                aria-label={newsletter.placeholder}
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

        <div className="footer__links">
          {footerColumns.map((col) => (
            <div className="footer__col" key={col.title}>
              <h3 className="footer__col-title">{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer__col">
            <h3 className="footer__col-title">Say hello</h3>
            <ul>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
                  {site.instagramHandle}
                </a>
              </li>
              <li className="footer__muted">{site.location}</li>
            </ul>
          </div>
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          {site.name}
        </p>

        <div className="footer__bottom">
          <span>{footerBottom.copyright}</span>
          <span className="footer__final script">{footerBottom.tagline}</span>
          <nav className="footer__legal" aria-label="Legal">
            {footerBottom.legalLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
