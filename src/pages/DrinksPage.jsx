import { useEffect, useState } from "react";
import {
  categories,
  combo,
  isBite,
  defaultOptions,
  drinks,
  drinksPage,
  optionGroups,
  shop,
  unitPrice,
} from "../data/drinks";
import { formatNaira, useCart } from "../shop/cart";
import DrinkCup from "../components/DrinkCup";
import "./DrinksPage.css";

export default function DrinksPage() {
  const [category, setCategory] = useState("All");
  const cart = useCart();

  useEffect(() => {
    document.title = "Drinks & Bites — Order Ahead | Breakfast Club";
  }, []);

  const shown = category === "All" ? drinks : drinks.filter((d) => d.category === category);
  const usedCategories = categories.filter(
    (c) => c === "All" || drinks.some((d) => d.category === c)
  );

  return (
    <>
      <section className="drinks-hero section">
        <div className="section__inner">
          <p className="eyebrow">{drinksPage.eyebrow}</p>
          <h1 className="drinks-hero__heading">{drinksPage.heading}</h1>
          <p className="drinks-hero__sub measure">{drinksPage.sub}</p>
          <p className="drinks-hero__next" role="status">
            {cart.pickup ? (
              <>
                <span className="drinks-hero__dot" aria-hidden="true" />
                Now taking orders for <strong>{cart.pickup.label}</strong> · order by{" "}
                {cart.pickup.cutoffLabel}
              </>
            ) : (
              "Pre-orders are paused right now — check back soon."
            )}
          </p>
          <ul className="drinks-hero__pills">
            <li>
              <strong>{shop.pickupLabel}</strong> Free · from {shop.meetupTime}
            </li>
            <li>
              <strong>Delivery</strong> {shop.deliveryDetail} · {formatNaira(shop.deliveryFee)}
            </li>
          </ul>
        </div>
      </section>

      <section id="shop" className="drinks-shop section" aria-labelledby="shop-heading">
        <div className="section__inner">
          <div className="drinks-shop__bar">
            <h2 id="shop-heading" className="drinks-shop__heading">The menu</h2>
            <div className="drinks-shop__filters" role="group" aria-label="Filter drinks">
              {usedCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="chip"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {combo.enabled && (
            <div className="combo-banner">
              <span className="combo-banner__tag">{combo.label}</span>
              <p>
                <strong>{combo.pitch}</strong> — save {formatNaira(combo.discount)} on every pair.
                Applied automatically at checkout.
              </p>
              {category !== "Bites" && (
                <button type="button" className="combo-banner__link" onClick={() => setCategory("Bites")}>
                  See the bites →
                </button>
              )}
            </div>
          )}

          <ul className="drinks-grid">
            {shown.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} onAdd={cart.add} />
            ))}
          </ul>
        </div>
      </section>

      <section className="drinks-how section">
        <div className="section__inner">
          <p className="eyebrow">How it works</p>
          <ol className="drinks-how__steps">
            {drinksPage.howItWorks.map((step, i) => (
              <li key={step.title}>
                <span className="drinks-how__num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="drinks-faq section">
        <div className="section__inner drinks-faq__inner">
          <h2 className="drinks-faq__heading">Good to know</h2>
          <div>
            {drinksPage.faqs.map((f) => (
              <details key={f.q} className="drinks-faq__item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {cart.count > 0 && !cart.isOpen && (
        <button type="button" className="cart-bar" onClick={cart.open}>
          <span>
            View cart · {cart.count} {cart.count === 1 ? "item" : "items"}
          </span>
          <strong>{formatNaira(cart.subtotal)}</strong>
        </button>
      )}
    </>
  );
}

function DrinkCard({ drink, onAdd }) {
  const [size, setSize] = useState(drink.sizes[0].label);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [opts, setOpts] = useState(() => defaultOptions(drink));
  const price = unitPrice(drink, size, opts);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  function handleAdd() {
    onAdd(drink.id, size, opts, qty);
    setAdded(true);
    setQty(1);
    setOpts(defaultOptions(drink));
  }

  return (
    <li className={`drink${drink.available ? "" : " drink--soldout"}`}>
      <div className="drink__media" style={{ background: drink.colors.bg }}>
        {drink.badge && <span className="drink__badge">{drink.badge}</span>}
        {drink.image && !photoFailed ? (
          <img
            className="drink__photo"
            src={drink.image}
            alt={drink.name}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <DrinkCup className="drink__cup" colors={drink.colors} bite={isBite(drink)} />
        )}
      </div>

      <div className="drink__body">
        <div className="drink__head">
          <h3 className="drink__name">{drink.name}</h3>
          <span className="drink__price">{formatNaira(price)}</span>
        </div>
        <p className="drink__desc">{drink.description}</p>
        {isBite(drink) && drink.sizes.length === 1 && (
          <p className="drink__size">{drink.sizes[0].label}</p>
        )}
        <ul className="drink__tags">
          {drink.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {combo.enabled && drink.available && (
          <p className="drink__combo">
            + {isBite(drink) ? "any drink" : "any bite"} = save {formatNaira(combo.discount)}
          </p>
        )}

        {drink.available ? (
          <>
            {drink.sizes.length > 1 && (
              <div className="seg" role="radiogroup" aria-label={`${drink.name} size`}>
                {drink.sizes.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    role="radio"
                    aria-checked={size === s.label}
                    onClick={() => setSize(s.label)}
                  >
                    {s.label}
                    <small>{formatNaira(unitPrice(drink, s.label, opts))}</small>
                  </button>
                ))}
              </div>
            )}

            {drink.options?.length > 0 && (
              <div className="drink__opts">
                {drink.options.map((g) => (
                  <label key={g} className="opt">
                    <span>{optionGroups[g].label}</span>
                    <select
                      value={opts[g]}
                      onChange={(e) => setOpts((o) => ({ ...o, [g]: e.target.value }))}
                    >
                      {optionGroups[g].choices.map((c) => (
                        <option key={c.label} value={c.label}>
                          {c.label}
                          {c.extra ? ` (+${formatNaira(c.extra)})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <div className="drink__actions">
              <Stepper
                value={qty}
                onChange={setQty}
                label={`Quantity of ${drink.name}`}
              />
              <button type="button" className="btn drink__add" onClick={handleAdd}>
                {added ? "Added ✓" : `Add · ${formatNaira(price * qty)}`}
              </button>
            </div>
          </>
        ) : (
          <p className="drink__soldout">Sold out this week</p>
        )}
      </div>
    </li>
  );
}

export function Stepper({ value, onChange, label, min = 1 }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={value >= 20}
      >
        +
      </button>
    </div>
  );
}
