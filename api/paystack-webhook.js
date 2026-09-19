// Paystack calls this after every successful payment — even if the customer
// closed their browser. Set it in Paystack Dashboard → Settings → API Keys &
// Webhooks → Webhook URL:  https://joinbreakfastclub.world/api/paystack-webhook
import crypto from "node:crypto";
import {
  alertText,
  checkPayment,
  notifyCustomer,
  notifyOwner,
  paystackVerify,
  secretKey,
} from "./_lib/orders.js";

export async function POST(request) {
  const raw = await request.text();

  // 1. Make sure the request really came from Paystack.
  const expected = crypto.createHmac("sha512", secretKey()).update(raw).digest("hex");
  const given = request.headers.get("x-paystack-signature") || "";
  if (
    given.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  ) {
    return new Response("Bad signature", { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return new Response("ignored");

  // 2. Double-check with Paystack directly, then re-price from the menu.
  let tx;
  try {
    tx = await paystackVerify(event.data.reference);
  } catch (err) {
    console.error(err);
    tx = event.data; // fall back to the signed payload
  }
  const check = checkPayment(tx);

  // Payments that aren't shop orders (e.g. a payment link) have no order.
  if (!check.order) {
    await notifyOwner("Paystack payment", `Payment received: ref ${tx.reference}`);
    return new Response("ok");
  }

  // 3. Alert you, and send the customer a confirmation if set up.
  const subject = `${check.amountOk ? "New paid order" : "⚠️ Check payment"} ${check.order.id}`;
  await notifyOwner(subject, alertText(tx, check));
  if (check.ok) await notifyCustomer(check.order, check);

  return new Response("ok");
}
