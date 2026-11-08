# LEVEL UP

An AI personal-coach web app for training, school, sport and habits — with real
accounts, sessions and subscription billing.

## Run locally

```bash
npm install
npm start
# http://localhost:3000
```

`PORT` and `DATA_DIR` are optional environment variables (`DATA_DIR` defaults to
`./data`).

## Accounts

- Sign up, sign in and sign out are handled by the server (`/api/auth/*`).
- Passwords are hashed with scrypt + a per-user random salt; only the hash is stored.
- Sessions use an HttpOnly, SameSite=Lax cookie with a 30-day sliding expiry; the
  server stores only a SHA-256 hash of the session token.
- Login and registration are rate limited, and state-changing requests are
  origin-checked.
- Each account gets its own local app state (goals, habits, streaks) keyed by user id.
  "Explore the demo" keeps everything on the device without an account.

## Plans and payments

| Plan | Monthly | Annual |
| --- | --- | --- |
| Starter | Free | Free |
| Plus | $4.99 | $47.90 |
| Pro | $9.99 | $95.90 |

- Plans, checkout, cancellation/resume, card updates and invoices are served from
  `/api/billing/*`.
- **Payments run in test mode.** Card numbers are validated (Luhn + expiry + CVC)
  and then discarded — only the brand, last 4 digits and expiry are stored. No
  charge is made and no card data reaches a payment processor.
- Promo code `LEVELUP20` takes 20% off the first charge.

To take real payments, replace `validateCard` / the checkout handler in
`server.js` with a provider such as Stripe Checkout, and store the provider's
customer/subscription ids instead of the card summary.

## Data storage

Accounts and invoices are stored in `data/db.json`. AppJet's Free hosting plan has
no persistent disk, so this file is recreated on each deploy — accounts created on
a live deployment will not survive a redeploy. A persistent disk (Starter plan and
up) or an external database is required for durable accounts.

## Project layout

```
server.js          Express API: auth, sessions, billing, static hosting
public/index.html  Phone-frame UI (home, fitness, sports, school, profile, billing)
public/styles.css  Design system and screen styles
public/app.js      Coach app logic and local state
public/account.js  Sign-in gate and billing client
test/smoke.test.js API regression test (auth + billing)
```
