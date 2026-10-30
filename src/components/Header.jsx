import { useEffect, useState } from "react";
import { site } from "../data/content";
import { useCart } from "../shop/cart";
import "./Header.css";

const LINKS = [
  { label: "About", href: "/#why-we-exist" },
  { label: "Experiences", href: "/#experiences" },
  { label: "Calendar", href: "/calendar" },
  { label: "Drinks", href: "/drinks" },
];

export default function Header({ path = "/" }) {
  const cart = useCart();
  const [open, setOpen] = useState(false);

  // Close on Escape, lock page scroll while the mobile menu is open, and
  // close if the screen grows to desktop size.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 861px)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = (href) => (href === path ? "page" : undefined);
  const close = () => setOpen(false);

  return (
    <header className="header" data-open={open || undefined}>
      <div className="header__inner">
        <a className="header__mark" href="/" onClick={close}>
          <i className="header__mark-icon" aria-hidden="true" />
          {site.name}
        </a>

        <nav className="header__nav" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} className="header__link" href={l.href} aria-current={current(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <a className="header__cta" href={site.waitlistUrl}>
            Join
          </a>
          <button
            type="button"
            className="header__icon header__cart"
            onClick={() => {
              close();
              cart.open();
            }}
            aria-label={`Cart, ${cart.count} ${cart.count === 1 ? "item" : "items"}`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M6 7h12l-1.2 12.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9L6 7Zm3 0V6a3 3 0 0 1 6 0v1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            {cart.count > 0 && <span className="header__badge">{cart.count}</span>}
          </button>
          <button
            type="button"
            className="header__icon header__burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mnav" hidden={!open}>
        <nav className="mnav__links" aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={current(l.href)}
              onClick={close}
              style={{ "--i": i }}
            >
              {l.label}
              <span aria-hidden="true">→</span>
            </a>
          ))}
        </nav>
        <a className="btn mnav__cta" href={site.waitlistUrl} onClick={close}>
          Join the Community
        </a>
        <p className="mnav__meta">
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
            {site.instagramHandle}
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
      {open && <div className="mnav__scrim" onClick={close} aria-hidden="true" />}
    </header>
  );
}
