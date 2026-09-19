import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { drinks, optionsSummary, shop, unitPrice } from "../data/drinks";
import { nextPickup } from "./schedule";

const STORAGE_KEY = "bc-cart-v2";
const CartContext = createContext(null);

export const formatNaira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

// Same drink + size + options = same line; anything different = new line.
export const lineKey = (id, size, opts = {}) =>
  `${id}::${size}::${Object.keys(opts)
    .sort()
    .map((k) => `${k}=${opts[k]}`)
    .join("&")}`;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Drop anything no longer on the menu, sold out, or with options that
    // no longer exist — prices are always recalculated from the menu.
    return parsed
      .map((line) => {
        const drink = drinks.find((d) => d.id === line.id && d.available);
        if (!drink || unitPrice(drink, line.size, line.opts) === null) return null;
        if (!(line.qty > 0)) return null;
        return { id: drink.id, size: line.size, opts: line.opts || {}, qty: Math.min(line.qty, 20) };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(loadCart);
  const [isOpen, setOpen] = useState(false);
  const [fulfilment, setFulfilment] = useState("pickup");
  const [pickup, setPickup] = useState(() => nextPickup());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode etc. — cart still works for this visit */
    }
  }, [lines]);

  // Keep the pickup date right if the page stays open past the cut-off.
  useEffect(() => {
    const t = setInterval(() => setPickup(nextPickup()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const value = useMemo(() => {
    const items = lines.map((line) => {
      const drink = drinks.find((d) => d.id === line.id);
      const price = unitPrice(drink, line.size, line.opts);
      return {
        ...line,
        key: lineKey(line.id, line.size, line.opts),
        drink,
        price,
        total: price * line.qty,
        optionsText: optionsSummary(drink, line.opts),
      };
    });
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.total, 0);
    const deliveryFee = fulfilment === "delivery" && count > 0 ? shop.deliveryFee : 0;

    return {
      items,
      count,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      fulfilment,
      setFulfilment,
      pickup,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add(id, size, opts = {}, qty = 1) {
        const key = lineKey(id, size, opts);
        setLines((prev) => {
          const existing = prev.find((l) => lineKey(l.id, l.size, l.opts) === key);
          if (existing) {
            return prev.map((l) =>
              l === existing ? { ...l, qty: Math.min(l.qty + qty, 20) } : l
            );
          }
          return [...prev, { id, size, opts, qty }];
        });
      },
      setQty(key, qty) {
        setLines((prev) =>
          prev
            .map((l) =>
              lineKey(l.id, l.size, l.opts) === key ? { ...l, qty: Math.min(qty, 20) } : l
            )
            .filter((l) => l.qty > 0)
        );
      },
      remove(key) {
        setLines((prev) => prev.filter((l) => lineKey(l.id, l.size, l.opts) !== key));
      },
      clear: () => setLines([]),
    };
  }, [lines, isOpen, fulfilment, pickup]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
