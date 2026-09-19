import { shop } from "../data/drinks";
import { formatNaira } from "./cart";

export function makeOrderId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `BC-${id}`;
}

export function orderSummaryText(order) {
  const lines = order.items.map(
    (i) =>
      `• ${i.qty} × ${i.drink.name}${i.detail ? ` (${i.detail})` : ""} — ${formatNaira(i.total)}`
  );
  const how =
    order.fulfilment === "delivery"
      ? `Delivery on ${order.pickup.label} to: ${order.customer.address}`
      : `${shop.pickupLabel} — ${order.pickup.label}, ${shop.meetupTime}`;

  return [
    `Hi Breakfast Club! New drinks order ${order.id}`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatNaira(order.subtotal)}`,
    order.discount ? `Combo savings: −${formatNaira(order.discount)}` : null,
    order.deliveryFee ? `Delivery: ${formatNaira(order.deliveryFee)}` : null,
    `Total: ${formatNaira(order.total)}`,
    "",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    order.customer.email ? `Email: ${order.customer.email}` : null,
    how,
    order.customer.note ? `Note: ${order.customer.note}` : null,
    order.paymentRef ? `Paid online — Paystack ref ${order.paymentRef}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function whatsappUrl(order) {
  return `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(orderSummaryText(order))}`;
}

export function emailUrl(order) {
  return `mailto:${shop.orderEmail}?subject=${encodeURIComponent(
    `Drinks order ${order.id}`
  )}&body=${encodeURIComponent(orderSummaryText(order))}`;
}

// ── Paystack ─────────────────────────────────────────────────────────────
let paystackLoader;
function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve();
  if (!paystackLoader) {
    paystackLoader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v2/inline.js";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => {
        paystackLoader = null;
        reject(new Error("Couldn't reach Paystack. Check your connection and try again."));
      };
      document.head.appendChild(s);
    });
  }
  return paystackLoader;
}

// Opens the Paystack popup. Resolves with the transaction reference on
// success, resolves null if the customer closes the popup.
export async function payWithPaystack(order) {
  await loadPaystack();
  return new Promise((resolve, reject) => {
    const popup = new window.PaystackPop();
    popup.newTransaction({
      key: shop.paystackPublicKey,
      email: order.customer.email,
      amount: Math.round(order.total * 100), // kobo
      currency: "NGN",
      reference: `${order.id}-${Date.now()}`,
      metadata: {
        order_id: order.id,
        // Structured copy for the server-side check + order alert.
        order: {
          id: order.id,
          pickupDate: order.pickup.date,
          fulfilment: order.fulfilment,
          items: order.items.map((i) => ({ id: i.id, size: i.size, opts: i.opts, qty: i.qty })),
          customer: order.customer,
        },
        custom_fields: [
          { display_name: "Name", variable_name: "name", value: order.customer.name },
          { display_name: "Phone", variable_name: "phone", value: order.customer.phone },
          { display_name: "For", variable_name: "pickup_date", value: order.pickup.label },
          {
            display_name: "Fulfilment",
            variable_name: "fulfilment",
            value:
              order.fulfilment === "delivery"
                ? `Delivery: ${order.customer.address}`
                : "Pickup at Saturday meetup",
          },
          {
            display_name: "Items",
            variable_name: "items",
            value: order.items
              .map((i) => `${i.qty}x ${i.drink.name}${i.detail ? ` (${i.detail})` : ""}`)
              .join("; "),
          },
          { display_name: "Note", variable_name: "note", value: order.customer.note || "-" },
        ],
      },
      onSuccess: (tx) => resolve(tx.reference),
      onCancel: () => resolve(null),
      onError: (err) => reject(new Error(err?.message || "Payment could not start.")),
    });
  });
}

// Asks our server function to confirm the payment with Paystack. Returns
// { ok: true } when confirmed. If the check itself can't run (e.g. testing
// locally with `npm run dev`, where /api doesn't exist) we return
// { ok: null } and still treat the order as placed — Paystack's webhook
// alert is the source of truth either way.
export async function verifyPayment(reference) {
  try {
    const res = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const isJson = (res.headers.get("content-type") || "").includes("json");
    if (res.status === 404 || !isJson) return { ok: null };
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(data.ok), message: data.message };
  } catch {
    return { ok: null };
  }
}
