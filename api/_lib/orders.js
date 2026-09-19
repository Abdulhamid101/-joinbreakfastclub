// Shared server-side helpers for the drinks shop. Files in api/_lib are not
// exposed as endpoints (Vercel ignores paths starting with "_").
import { comboDiscount, drinks, itemDetail, shop, unitPrice } from "../../src/data/drinks.js";

const PAYSTACK = "https://api.paystack.co";
const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

export function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set in Vercel env vars");
  return key;
}

export async function paystackVerify(reference) {
  const res = await fetch(`${PAYSTACK}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.status) throw new Error(body.message || `Paystack returned ${res.status}`);
  return body.data;
}

// Paystack sometimes hands metadata back as a JSON string.
export function readOrder(tx) {
  let meta = tx?.metadata;
  if (typeof meta === "string") {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = {};
    }
  }
  return meta?.order || null;
}

// Re-price the order from the real menu so a tampered browser can't pay
// ₦100 for ₦10,000 of drinks.
export function priceOrder(order) {
  const lines = [];
  const counted = [];
  let subtotal = 0;
  const problems = [];

  for (const item of order?.items || []) {
    const drink = drinks.find((d) => d.id === item.id);
    const price = drink ? unitPrice(drink, item.size, item.opts || {}) : null;
    const qty = Math.max(0, Math.min(20, Number(item.qty) || 0));
    if (price === null || !qty) {
      problems.push(`Unknown item: ${JSON.stringify(item)}`);
      continue;
    }
    subtotal += price * qty;
    counted.push({ drink, qty });
    const detail = itemDetail(drink, item.size, item.opts || {});
    lines.push(`${qty} × ${drink.name}${detail ? ` (${detail})` : ""} — ${naira(price * qty)}`);
  }

  const { discount, pairs } = comboDiscount(counted);
  const deliveryFee = order?.fulfilment === "delivery" ? shop.deliveryFee : 0;
  return {
    lines,
    subtotal,
    discount,
    pairs,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
    problems,
  };
}

export function checkPayment(tx) {
  const order = readOrder(tx);
  const priced = priceOrder(order);
  const paid = (tx?.amount || 0) / 100;
  const success = tx?.status === "success" && tx?.currency === "NGN";
  const amountOk = order && priced.problems.length === 0 && paid >= priced.total;
  return { order, priced, paid, success, amountOk, ok: Boolean(success && amountOk) };
}

function pickupLabel(iso) {
  if (!iso) return "next meetup";
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function alertText(tx, check) {
  const { order, priced, paid, amountOk } = check;
  const c = order?.customer || {};
  const when = pickupLabel(order?.pickupDate);
  return [
    amountOk ? "✅ PAID drinks order" : "⚠️ PAYMENT NEEDS CHECKING — amount doesn't match the menu",
    `${order?.id || "?"} · ${naira(paid)} · ref ${tx.reference}`,
    "",
    ...priced.lines.map((l) => `• ${l}`),
    ...priced.problems.map((p) => `⚠️ ${p}`),
    priced.discount ? `Combo savings (${priced.pairs}×): −${naira(priced.discount)}` : null,
    priced.deliveryFee ? `Delivery fee: ${naira(priced.deliveryFee)}` : null,
    `Menu total: ${naira(priced.total)} · Paid: ${naira(paid)}`,
    "",
    order?.fulfilment === "delivery"
      ? `🛵 DELIVERY — ${when}\n${c.address || "(no address)"}`
      : `📍 PICKUP at the meetup — ${when}, ${shop.meetupTime}`,
    "",
    `Name: ${c.name || "-"}`,
    `Phone: ${c.phone || "-"}`,
    `Email: ${c.email || tx.customer?.email || "-"}`,
    c.note ? `Note: ${c.note}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// ── Notifications ────────────────────────────────────────────────────────
// Configure any of these in Vercel → Project → Settings → Environment
// Variables. Anything not configured is skipped.
export async function notifyOwner(subject, text) {
  const jobs = [];

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
      })
    );
  }

  if (process.env.RESEND_API_KEY && process.env.ORDER_ALERT_EMAIL) {
    jobs.push(
      sendEmail({
        to: process.env.ORDER_ALERT_EMAIL,
        subject,
        text,
      })
    );
  }

  const results = await Promise.allSettled(jobs);
  results
    .filter((r) => r.status === "rejected")
    .forEach((r) => console.error("Order alert failed:", r.reason));
  return jobs.length;
}

export async function notifyCustomer(order, check) {
  const to = order?.customer?.email;
  // Needs your own domain verified in Resend (RESEND_FROM set), otherwise
  // Resend only lets you email yourself.
  if (!to || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return;
  const when = pickupLabel(order.pickupDate);
  const text = [
    `Hi ${order.customer.name || "there"},`,
    "",
    `Thanks for your order ${order.id} — payment received.`,
    "",
    ...check.priced.lines.map((l) => `• ${l}`),
    check.priced.discount ? `Combo savings: −${naira(check.priced.discount)}` : null,
    check.priced.deliveryFee ? `Delivery: ${naira(check.priced.deliveryFee)}` : null,
    `Total paid: ${naira(check.paid)}`,
    "",
    order.fulfilment === "delivery"
      ? `We'll deliver on ${when} to ${order.customer.address}, and call you before we head out.`
      : `Collect it at the Breakfast Club meetup on ${when}, from ${shop.meetupTime}. Your name will be on your cup.`,
    "",
    "See you Saturday,",
    "Breakfast Club",
  ]
    .filter((l) => l !== null)
    .join("\n");
  await sendEmail({ to, subject: `Your Breakfast Club order ${order.id}`, text }).catch((e) =>
    console.error("Customer email failed:", e)
  );
}

async function sendEmail({ to, subject, text }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Breakfast Club Orders <onboarding@resend.dev>",
      to: [to],
      reply_to: shop.orderEmail,
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
