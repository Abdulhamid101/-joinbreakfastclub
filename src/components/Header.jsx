import { site } from "../data/content";
import { useCart } from "../shop/cart";
import "./Header.css";

export default function Header({ path = "/" }) {
  const cart = useCart();

  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__mark" href="/">
          <i className="header__mark-icon" aria-hidden="true" />
          {site.name}
        </a>
        <nav className="header__nav">
          <a
            className="header__link"
            href="/drinks"
            aria-current={path === "/drinks" ? "page" : undefined}
          >
            Drinks
          </a>
         
          <a className="header__cta" href={site.waitlistUrl}>
            Join
          </a>
           <button
            type="button"
            className="header__cart"
            onClick={cart.open}
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
        </nav>
      </div>
    </header>
  );
}
