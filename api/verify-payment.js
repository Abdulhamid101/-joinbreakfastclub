// Called by the checkout right after the Paystack popup succeeds, so the
// customer only sees "Payment confirmed" once Paystack's server agrees and
// the amount matches the menu. (Alerts are sent by the webhook, not here,
// so you never get the same order twice.)
import { checkPayment, paystackVerify } from "./_lib/orders.js";

export async function POST(request) {
  let reference;
  try {
    ({ reference } = await request.json());
  } catch {
    return Response.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
  if (!reference || typeof reference !== "string" || reference.length > 100) {
    return Response.json({ ok: false, message: "Missing reference" }, { status: 400 });
  }

  try {
    const tx = await paystackVerify(reference);
    const check = checkPayment(tx);
    if (check.ok) return Response.json({ ok: true, orderId: check.order.id });
    return Response.json({
      ok: false,
      message: check.success
        ? "Your payment went through but the amount didn't match your order. We'll contact you to sort it out."
        : "We couldn't confirm your payment yet.",
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { ok: false, message: "We couldn't confirm your payment right now." },
      { status: 502 }
    );
  }
}
