# Admin, calendar & security — setup (one time, ~10 minutes)

After this, the owner goes to **https://joinbreakfastclub.world/admin**, logs in,
and can change events, drinks, prices, opening schedule and every piece of text
on the site — no code, no redeploy. Changes go live in about 20 seconds.

## 1. Connect storage (free)
1. Vercel → your project → **Storage** → **Create Database** → **Upstash for Redis** (free plan) → connect it to this project.
2. That adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. Nothing to copy.

## 2. Create the admin login
On your computer, in this folder:

```
npm run admin:setup
```

Type the owner's password (12+ chars, upper + lower case, number, symbol). It prints three values.
Add each one in Vercel → **Settings → Environment Variables** (Production), tick **Sensitive**:

| Name | What it is |
|---|---|
| `ADMIN_PASSWORD_HASH` | Scrambled password (the real password is never stored) |
| `ADMIN_SESSION_SECRET` | Signs login sessions |
| `ADMIN_TOTP_SECRET` | 2-step login code (strongly recommended) |

Put the setup key it prints into **Google Authenticator** on the owner's phone (+ → *Enter a setup key*).

## 3. Redeploy
`git push` (or Vercel → Deployments → Redeploy). Open `/admin` — if anything is missing it shows a checklist.

## 4. Optional but recommended
- Set up Telegram/email alerts (SHOP-SETUP.md §2). The admin then pings you on every login and when someone is blocked for guessing passwords.
- Submit `joinbreakfastclub.world` at https://hstspreload.org (the site already sends the right header).

## What the owner can do
- **Calendar** — add/edit/cancel each Saturday's activity, upload a flyer, "Repeat next week". Saturdays without an event show "Saturday Meetup — details coming soon" automatically.
- **Drinks shop** — prices, sold out, new drinks/bites, photos, delivery fee, cut-off time, weeks off, WhatsApp number, combo deal.
- **Home page / Footer** — every heading, paragraph, list and link.
- **History & security** — restore any of the last 25 versions, see the activity log, log out every device.

## Security built in
- Password stored only as a scrypt hash; optional 2-step codes (single-use).
- 5 login attempts per 15 min per IP, plus a site-wide cap; owner alerted on lock-outs and logins.
- Sessions: random, server-side, HttpOnly + Secure + SameSite=Strict `__Host-` cookie; 2h idle / 12h max; auto-logout after 30 min idle in the browser.
- CSRF protection (origin check + custom header) on every change.
- Every saved value is validated on the server **and** in the browser: same shape as the original, no `javascript:`/`data:` links, images only from our own uploads, prices/dates/times in range, Paystack *secret* keys rejected.
- Uploads: JPG/PNG/WebP only, checked by file contents (no SVG), served with a locked-down CSP.
- Site-wide: strict Content-Security-Policy, HSTS, no framing (clickjacking), nosniff, tight Permissions-Policy; `/admin` and `/api` are no-index.
- Payments: payment-check endpoint rate-limited; webhook signature-checked, size-capped and replay-proof; admin price changes are used when verifying payments; customer fields are length-capped in alerts.

## Local development
`npm run dev` shows the site with built-in content (no admin). To run the admin locally use `npx vercel dev` with the env vars above in `.env.local` (git-ignored).

## Lost access?
- Forgot password → run `npm run admin:setup` again, replace the 3 env vars, redeploy (also logs everyone out).
- Lost phone → same as above (new 2-step key).
