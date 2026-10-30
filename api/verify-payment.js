// Called by the checkout right after the Paystack popup succeeds, so the
// customer only sees "Payment confirmed" once Paystack's server agrees and
// the amount matches the menu. (Alerts are sent by the webhook, not here,
// so you never get the same order twice.)
import { clientIp, json, rateLimit, readJson, tooMany } from "./_lib/http.js";
import { loadLatestContent } from "./_lib/content-store.js";
import { checkPayment, paystackVerify } from "./_lib/orders.js";

const REF = /^[A-Za-z0-9._=-]{6,100}$/;

export async function POST(request) {
  const limit = await rateLimit(`verify:${clientIp(request)}`, 20, 10 * 60);
  if (!limit.ok) return tooMany(limit.retryAfter);

  let reference;
  try {
    ({ reference } = await readJson(request, 1024));
  } catch {
    return json({ ok: false, message: "Bad request" }, 400);
  }
  if (typeof reference !== "string" || !REF.test(reference)) {
    return json({ ok: false, message: "Missing reference" }, 400);
  }

  try {
    await loadLatestContent();
    const tx = await paystackVerify(reference);
    const check = checkPayment(tx);
    if (check.ok) return json({ ok: true, orderId: check.order.id });
    return json({
      ok: false,
      message: check.success
        ? "Your payment went through but the amount didn't match your order. We'll contact you to sort it out."
        : "We couldn't confirm your payment yet.",
    });
  } catch (err) {
    console.error(err);
    return json({ ok: false, message: "We couldn't confirm your payment right now." }, 502);
  }
}
