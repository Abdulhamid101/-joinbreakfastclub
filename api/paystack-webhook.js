// Paystack calls this after every successful payment — even if the customer
// closed their browser. Set it in Paystack Dashboard → Settings → API Keys &
// Webhooks → Webhook URL:  https://joinbreakfastclub.world/api/paystack-webhook
import crypto from "node:crypto";
import { loadLatestContent } from "./_lib/content-store.js";
import { hasRedis, redis } from "./_lib/redis.js";
import {
  alertText,
  checkPayment,
  notifyCustomer,
  notifyOwner,
  paystackVerify,
  secretKey,
} from "./_lib/orders.js";

const MAX_BODY = 200 * 1024;

export async function POST(request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) {
    return new Response("Too large", { status: 413 });
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY) return new Response("Too large", { status: 413 });

  // 1. Make sure the request really came from Paystack.
  let key;
  try {
    key = secretKey();
  } catch (err) {
    console.error(err.message);
    return new Response("Not configured", { status: 503 });
  }
  const expected = crypto.createHmac("sha512", key).update(raw).digest("hex");
  const given = request.headers.get("x-paystack-signature") || "";
  if (
    given.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  ) {
    return new Response("Bad signature", { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad body", { status: 400 });
  }
  if (event.event !== "charge.success") return new Response("ignored");

  const reference = String(event.data?.reference || "");
  if (!reference || reference.length > 100) return new Response("Bad reference", { status: 400 });

  // 2. Replay protection: each payment is handled once, even if Paystack
  // (or anyone replaying a captured request) sends it again.
  const seenKey = `bc:paid:${reference}`;
  if (hasRedis()) {
    try {
      if (await redis("EXISTS", seenKey)) return new Response("ok (already handled)");
    } catch (err) {
      console.error("dedupe:", err.message);
    }
  }

  // 3. Double-check with Paystack directly, then re-price from the menu.
  await loadLatestContent();
  let tx;
  try {
    tx = await paystackVerify(reference);
  } catch (err) {
    console.error(err);
    tx = event.data; // fall back to the signed payload
  }
  const check = checkPayment(tx);

  // Payments that aren't shop orders (e.g. a payment link) have no order.
  if (!check.order) {
    await notifyOwner("Paystack payment", `Payment received: ref ${tx.reference}`);
    await markHandled(seenKey);
    return new Response("ok");
  }

  // 4. Alert you, and send the customer a confirmation if set up.
  const subject = `${check.amountOk ? "New paid order" : "⚠️ Check payment"} ${String(check.order.id).slice(0, 20)}`;
  await notifyOwner(subject, alertText(tx, check));
  if (check.ok) await notifyCustomer(check.order, check);
  await markHandled(seenKey);

  return new Response("ok");
}

// Marked only after alerts went out, so a failed run is retried by Paystack.
async function markHandled(key) {
  if (!hasRedis()) return;
  await redis("SET", key, "1", "EX", 30 * 24 * 3600).catch((err) => console.error("dedupe:", err.message));
}
