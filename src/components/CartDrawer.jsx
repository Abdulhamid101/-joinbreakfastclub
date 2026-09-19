import { useEffect, useRef, useState } from "react";
import { combo, defaultOptions, drinks, isBite, shop } from "../data/drinks";
import { formatNaira, useCart } from "../shop/cart";
import {
  emailUrl,
  makeOrderId,
  payWithPaystack,
  verifyPayment,
  whatsappUrl,
} from "../shop/checkout";
import { Stepper } from "../pages/DrinksPage";
import DrinkCup from "./DrinkCup";
import "./CartDrawer.css";

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", note: "" };
const canPay = Boolean(shop.paystackPublicKey);
const canWhatsApp = Boolean(shop.whatsappNumber);

export default function CartDrawer() {
  const cart = useCart();
  const [step, setStep] = useState("cart"); // cart | details | done
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false); // false | "paying" | "verifying"
  const [payError, setPayError] = useState("");
  const [placed, setPlaced] = useState(null);
  const closeRef = useRef(null);

  const { isOpen, close } = cart;

  // Lock page scroll and focus the close button when the drawer opens.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape closes (unless a payment is in progress).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && !busy && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, busy, close]);

  // Coming back after a finished order starts fresh.
  useEffect(() => {
    if (!cart.isOpen && step === "done") {
      setStep("cart");
      setPlaced(null);
    }
  }, [cart.isOpen, step]);

  if (!cart.isOpen) return null;

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  function validate(needEmail) {
    const er = {};
    if (form.name.trim().length < 2) er.name = "Please enter your name.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 14) er.phone = "Enter a valid phone number.";
    if (needEmail && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      er.email = "Paystack needs an email for your receipt.";
    if (cart.fulfilment === "delivery" && form.address.trim().length < 6)
      er.address = "Where should we deliver?";
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  function buildOrder(paymentRef = null) {
    return {
      id: makeOrderId(),
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      fulfilment: cart.fulfilment,
      pickup: cart.pickup,
      customer: Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])),
      paymentRef,
    };
  }

  function finish(order, method, verified = null, verifyMessage = "") {
    setPlaced({ order, method, verified, verifyMessage });
    setStep("done");
    cart.clear();
    setForm(EMPTY_FORM);
  }

  async function handlePay() {
    setPayError("");
    if (!validate(true)) return;
    const order = buildOrder();
    setBusy("paying");
    try {
      const ref = await payWithPaystack(order);
      if (ref) {
        setBusy("verifying");
        const check = await verifyPayment(ref);
        finish({ ...order, paymentRef: ref }, "paystack", check.ok, check.message);
      }
    } catch (err) {
      setPayError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleSend() {
    if (!validate(false)) return;
    const order = buildOrder();
    const url = canWhatsApp ? whatsappUrl(order) : emailUrl(order);
    if (canWhatsApp) window.open(url, "_blank", "noopener");
    else window.location.href = url;
    finish(order, canWhatsApp ? "whatsapp" : "email");
  }

  const title =
    step === "done" ? "Order placed" : step === "details" ? "Your details" : "Your cart";

  return (
    <div className="drawer" role="presentation">
      <div className="drawer__scrim" onClick={() => !busy && cart.close()} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="drawer__head">
          {step === "details" ? (
            <button type="button" className="drawer__back" onClick={() => setStep("cart")}>
              ← Cart
            </button>
          ) : (
            <span />
          )}
          <h2 className="drawer__title">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className="drawer__close"
            aria-label="Close"
            onClick={cart.close}
            disabled={busy}
          >
            ×
          </button>
        </header>

        {step === "done" && placed && <Done placed={placed} onClose={cart.close} />}

        {step !== "done" && cart.count === 0 && (
          <div className="drawer__empty">
            <p>Your cart is empty.</p>
            <a className="btn" href="/drinks#shop" onClick={cart.close}>
              Browse the menu
            </a>
          </div>
        )}

        {step === "cart" && cart.count > 0 && (
          <>
            <ul className="drawer__lines">
              {cart.items.map((item) => (
                <li key={item.key} className="line">
                  <LineThumb drink={item.drink} />
                  <div className="line__info">
                    <p className="line__name">{item.drink.name}</p>
                    <p className="line__meta">
                      {item.detail ? `${item.detail} · ` : ""}
                      {formatNaira(item.price)}
                    </p>
                    <div className="line__controls">
                      <Stepper
                        value={item.qty}
                        min={0}
                        onChange={(q) => cart.setQty(item.key, q)}
                        label={`Quantity of ${item.drink.name}`}
                      />
                      <button type="button" className="line__remove" onClick={() => cart.remove(item.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="line__total">{formatNaira(item.total)}</p>
                </li>
              ))}
            </ul>

            <ComboNudge cart={cart} />

            <fieldset className="fulfil">
              <legend>How do you want it?</legend>
              {[
                [
                  "pickup",
                  shop.pickupLabel,
                  `Free · ${cart.pickup?.shortLabel || "next meetup"}, from ${shop.meetupTime}`,
                ],
                [
                  "delivery",
                  shop.deliveryLabel,
                  `${shop.deliveryDetail} · ${formatNaira(shop.deliveryFee)}`,
                ],
              ].map(([value, label, detail]) => (
                <label key={value} className="fulfil__opt">
                  <input
                    type="radio"
                    name="fulfilment"
                    value={value}
                    checked={cart.fulfilment === value}
                    onChange={() => cart.setFulfilment(value)}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <Totals cart={cart} />
            <div className="drawer__foot">
              {cart.pickup ? (
                <>
                  <p className="drawer__when">
                    For <strong>{cart.pickup.label}</strong> · order by {cart.pickup.cutoffLabel}
                  </p>
                  <button
                    type="button"
                    className="btn drawer__primary"
                    onClick={() => setStep("details")}
                  >
                    Checkout · {formatNaira(cart.total)}
                  </button>
                </>
              ) : (
                <p className="drawer__when">Pre-orders are paused right now — check back soon.</p>
              )}
            </div>
          </>
        )}

        {step === "details" && cart.count > 0 && !cart.pickup && (
          <div className="drawer__empty">
            <p>Pre-orders are paused right now — check back soon.</p>
          </div>
        )}

        {step === "details" && cart.count > 0 && cart.pickup && (
          <form
            className="checkout"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (canPay) handlePay();
              else handleSend();
            }}
          >
            <Field label="Full name" error={errors.name}>
              <input value={form.name} onChange={update("name")} autoComplete="name" required />
            </Field>
            <Field label="Phone number" error={errors.phone}>
              <input
                value={form.phone}
                onChange={update("phone")}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0801 234 5678"
                required
              />
            </Field>
            <Field label={canPay ? "Email (for your receipt)" : "Email (optional)"} error={errors.email}>
              <input value={form.email} onChange={update("email")} type="email" autoComplete="email" />
            </Field>
            {cart.fulfilment === "delivery" && (
              <Field label="Delivery address in Abeokuta" error={errors.address}>
                <textarea rows={2} value={form.address} onChange={update("address")} autoComplete="street-address" />
              </Field>
            )}
            <Field label="Anything we should know? (optional)">
              <textarea
                rows={2}
                value={form.note}
                onChange={update("note")}
                placeholder="Less ice, oat milk, name for the cup…"
              />
            </Field>

            <Totals cart={cart} compact />

            {payError && <p className="checkout__error" role="alert">{payError}</p>}

            <div className="drawer__foot drawer__foot--stack">
              {canPay && (
                <button type="submit" className="btn drawer__primary" disabled={busy}>
                  {busy === "verifying"
                    ? "Confirming payment…"
                    : busy
                      ? "Opening Paystack…"
                      : `Pay ${formatNaira(cart.total)} securely`}
                </button>
              )}
              <button
                type={canPay ? "button" : "submit"}
                className={`btn ${canPay ? "btn--ghost" : "drawer__primary"}`}
                onClick={canPay ? handleSend : undefined}
                disabled={busy}
              >
                {canWhatsApp ? "Send order on WhatsApp" : "Send order by email"}
              </button>
              {canPay && (
                <p className="checkout__fine">
                  Card, bank transfer & USSD via Paystack. Prefer to pay at pickup? Send it on{" "}
                  {canWhatsApp ? "WhatsApp" : "email"} instead.
                </p>
              )}
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}

function LineThumb({ drink }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="line__thumb" style={{ background: drink.colors.bg }}>
      {drink.image && !failed ? (
        <img src={drink.image} alt="" onError={() => setFailed(true)} />
      ) : (
        <DrinkCup colors={drink.colors} bite={isBite(drink)} />
      )}
    </div>
  );
}

// Nudges toward a complete combo: suggests bites when there are more drinks
// than bites, and a drink when there are more bites.
function ComboNudge({ cart }) {
  if (!combo.enabled) return null;
  const { drinkQty, biteQty } = cart.combo;
  if (drinkQty === biteQty) {
    return cart.combo.pairs > 0 ? (
      <p className="nudge nudge--done">
        You're saving {formatNaira(cart.discount)} with the {combo.label.toLowerCase()}.
      </p>
    ) : null;
  }

  const wantBite = drinkQty > biteQty;
  const suggestions = drinks.filter((d) => d.available && isBite(d) === wantBite).slice(0, 4);
  if (!suggestions.length) return null;

  return (
    <div className="nudge">
      <p className="nudge__title">
        {wantBite ? "Add a bite" : "Add a drink"}, save {formatNaira(combo.discount)}
        <small>
          {combo.pitch} = {combo.label.toLowerCase()}
        </small>
      </p>
      <ul className="nudge__list">
        {suggestions.map((d) => {
          const size = d.sizes[0];
          return (
            <li key={d.id}>
              <button
                type="button"
                className="nudge__item"
                onClick={() => cart.add(d.id, size.label, defaultOptions(d), 1)}
              >
                <NudgeThumb drink={d} />
                <span className="nudge__name">{d.name}</span>
                <span className="nudge__price">
                  {formatNaira(size.price)} <b>+ Add</b>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NudgeThumb({ drink }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="nudge__thumb" style={{ background: drink.colors.bg }}>
      {drink.image && !failed ? (
        <img src={drink.image} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <DrinkCup colors={drink.colors} bite={isBite(drink)} />
      )}
    </span>
  );
}

function Totals({ cart, compact }) {
  return (
    <dl className={`totals${compact ? " totals--compact" : ""}`}>
      <div>
        <dt>Subtotal</dt>
        <dd>{formatNaira(cart.subtotal)}</dd>
      </div>
      {cart.discount > 0 && (
        <div className="totals__saving">
          <dt>
            {combo.label} × {cart.combo.pairs}
          </dt>
          <dd>−{formatNaira(cart.discount)}</dd>
        </div>
      )}
      <div>
        <dt>{cart.fulfilment === "delivery" ? "Delivery" : "Pickup"}</dt>
        <dd>{cart.deliveryFee ? formatNaira(cart.deliveryFee) : "Free"}</dd>
      </div>
      <div className="totals__grand">
        <dt>Total</dt>
        <dd>{formatNaira(cart.total)}</dd>
      </div>
    </dl>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={`field${error ? " field--error" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

function Done({ placed, onClose }) {
  const { order, method, verified, verifyMessage } = placed;
  const message =
    method === "paystack"
      ? verified === false
        ? `${verifyMessage || "We couldn't confirm your payment yet."} Keep your reference: ${order.paymentRef}. If you were charged, you're covered — we'll sort it out.`
        : "Payment confirmed — thank you! We've got your order and a receipt is on its way to your email."
      : method === "whatsapp"
        ? "WhatsApp should have opened with your order. Hit send there and we'll confirm and share payment details."
        : "Your email app should have opened with your order. Hit send and we'll confirm and share payment details.";

  return (
    <div className="done">
      <div className={`done__check${verified === false ? " done__check--warn" : ""}`} aria-hidden="true">
        {verified === false ? "!" : "✓"}
      </div>
      <p className="done__id">Order {order.id}</p>
      <p className="done__msg">{message}</p>
      <ul className="done__items">
        {order.items.map((i) => (
          <li key={i.key}>
            <span>
              {i.qty} × {i.drink.name}{" "}
              {i.detail && <small>({i.detail})</small>}
            </span>
            <span>{formatNaira(i.total)}</span>
          </li>
        ))}
        {order.discount > 0 && (
          <li className="done__saving">
            <span>Combo savings</span>
            <span>−{formatNaira(order.discount)}</span>
          </li>
        )}
        <li className="done__total">
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </li>
      </ul>
      <p className="done__how">
        {order.fulfilment === "delivery"
          ? `Delivering on ${order.pickup.label} to ${order.customer.address}. We'll call ${order.customer.phone} before we head out.`
          : `Collect it at the meetup on ${order.pickup.label}, from ${shop.meetupTime}. Your name will be on your cup.`}
      </p>
      {method !== "paystack" && (
        <a
          className="btn btn--ghost"
          href={method === "whatsapp" ? whatsappUrl(order) : emailUrl(order)}
          target={method === "whatsapp" ? "_blank" : undefined}
          rel="noopener"
        >
          Didn't open? Send it again
        </a>
      )}
      <button type="button" className="btn" onClick={onClose}>
        Done
      </button>
    </div>
  );
}
