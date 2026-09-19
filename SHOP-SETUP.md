# Drinks shop — setup checklist

Menu, prices, options, schedule, Paystack public key and WhatsApp number all
live in `src/data/drinks.js`.

## 1. Paystack (take payments)
1. dashboard.paystack.com → Settings → API Keys & Webhooks.
2. Copy the **public** key into `paystackPublicKey` in `src/data/drinks.js`.
3. In Vercel → Project → Settings → Environment Variables add
   `PAYSTACK_SECRET_KEY` = your **secret** key (never put it in the code).
4. Back in Paystack, set **Webhook URL** to
   `https://joinbreakfastclub.world/api/paystack-webhook`
5. Redeploy on Vercel so the new variables take effect.

Test with `pk_test_…` / `sk_test_…` keys first (Paystack test card:
4084 0840 8408 4081, any future expiry, CVV 408), then switch both to live keys.

## 2. Instant order alerts (pick one or both)

**Telegram — free, instant push on your phone (recommended)**
1. In Telegram, message **@BotFather** → `/newbot` → copy the token.
2. Send any message to your new bot, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `"chat":{"id": …}`.
3. Vercel env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

**Email via Resend (free tier)**
1. Sign up at resend.com → API Keys → create one.
2. Vercel env vars: `RESEND_API_KEY`, `ORDER_ALERT_EMAIL` (the email you signed
   up to Resend with).
3. Optional — confirmation emails to customers: verify
   joinbreakfastclub.world in Resend (add the DNS records it shows at Truehost),
   then set `RESEND_FROM` = `Breakfast Club <orders@joinbreakfastclub.world>`.

## 3. Weekly schedule
In `src/data/drinks.js` → `shop`: meetup day, time, order cut-off
(default Friday 9 PM, Lagos time). Add a date to `closedDates`
(e.g. `"2026-12-26"`) to skip a week.

## How it fits together
- Customer pays in the Paystack popup → `/api/verify-payment` confirms it with
  Paystack and re-checks the amount against the menu.
- Paystack calls `/api/paystack-webhook` → you get the order alert (works even
  if the customer closes the page). Underpaid orders are flagged ⚠️.
- WhatsApp orders go straight to your WhatsApp (pay on pickup/transfer).
