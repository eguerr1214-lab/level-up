'use strict';

/* Regression test: account lifecycle and subscription billing.
   Boots the real server on an isolated port and data directory. */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORT = 3210;
const BASE = `http://127.0.0.1:${PORT}`;
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'levelup-test-'));

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function request(pathname, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(BASE + pathname, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data, setCookie: res.headers.get('set-cookie') || '' };
}

const cookieFrom = (setCookie) => setCookie.split(';')[0];

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server did not start');
}

async function run() {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT), DATA_DIR, NODE_ENV: 'test' },
    stdio: 'ignore',
  });

  try {
    await waitForServer();

    console.log('auth');
    const email = `runner+${Date.now()}@example.com`;
    const short = await request('/api/auth/register', { method: 'POST', body: { name: 'Test Runner', email, password: 'short' } });
    check('rejects short password', short.status === 400, `status ${short.status}`);

    const badEmail = await request('/api/auth/register', { method: 'POST', body: { name: 'Test Runner', email: 'nope', password: 'longenough1' } });
    check('rejects invalid email', badEmail.status === 400, `status ${badEmail.status}`);

    const created = await request('/api/auth/register', { method: 'POST', body: { name: 'Test Runner', email, password: 'levelup-pass-1' } });
    check('registers account', created.status === 201 && created.data?.user?.email === email, `status ${created.status}`);
    check('new account starts on free plan', created.data?.user?.plan === 'free', created.data?.user?.plan);
    check('sets session cookie', /lu_session=/.test(created.setCookie), created.setCookie);

    const duplicate = await request('/api/auth/register', { method: 'POST', body: { name: 'Test Runner', email, password: 'levelup-pass-1' } });
    check('rejects duplicate email', duplicate.status === 409, `status ${duplicate.status}`);

    let cookie = cookieFrom(created.setCookie);
    const session = await request('/api/auth/session', { cookie });
    check('session returns signed-in user', session.status === 200 && session.data?.user?.name === 'Test Runner', `status ${session.status}`);

    const noCookie = await request('/api/auth/session');
    check('session rejects anonymous request', noCookie.status === 401, `status ${noCookie.status}`);

    const wrongPass = await request('/api/auth/login', { method: 'POST', body: { email, password: 'wrong-password' } });
    check('rejects wrong password', wrongPass.status === 401, `status ${wrongPass.status}`);

    console.log('billing');
    const plans = await request('/api/billing/plans');
    check('lists three plans', plans.status === 200 && plans.data?.plans?.length === 3, `status ${plans.status}`);

    const anonymousCheckout = await request('/api/billing/checkout', {
      method: 'POST',
      body: { planId: 'plus', cycle: 'monthly', card: { number: '4242 4242 4242 4242', name: 'Test Runner', exp: '12/34', cvc: '123' } },
    });
    check('checkout requires auth', anonymousCheckout.status === 401, `status ${anonymousCheckout.status}`);

    const badCard = await request('/api/billing/checkout', {
      method: 'POST',
      cookie,
      body: { planId: 'plus', cycle: 'monthly', card: { number: '4242 4242 4242 4241', name: 'Test Runner', exp: '12/34', cvc: '123' } },
    });
    check('rejects invalid card number', badCard.status === 400, `status ${badCard.status}`);

    const expired = await request('/api/billing/checkout', {
      method: 'POST',
      cookie,
      body: { planId: 'plus', cycle: 'monthly', card: { number: '4242 4242 4242 4242', name: 'Test Runner', exp: '01/20', cvc: '123' } },
    });
    check('rejects expired card', expired.status === 400, `status ${expired.status}`);

    const checkout = await request('/api/billing/checkout', {
      method: 'POST',
      cookie,
      body: { planId: 'plus', cycle: 'monthly', card: { number: '4242 4242 4242 4242', name: 'Test Runner', exp: '12/34', cvc: '123' } },
    });
    check('subscribes to Plus', checkout.status === 200 && checkout.data?.user?.plan === 'plus', `status ${checkout.status}`);
    check('stores only card last4', checkout.data?.user?.card?.last4 === '4242' && !('number' in (checkout.data?.user?.card || {})), JSON.stringify(checkout.data?.user?.card));
    check('creates paid invoice', checkout.data?.invoice?.amount === 499 && checkout.data?.invoice?.status === 'paid', JSON.stringify(checkout.data?.invoice));

    const promo = await request('/api/billing/checkout', {
      method: 'POST',
      cookie,
      body: { planId: 'pro', cycle: 'annual', promo: 'LEVELUP20', card: { number: '4242424242424242', name: 'Test Runner', exp: '11/2030', cvc: '999' } },
    });
    check('applies annual promo pricing', promo.status === 200 && promo.data?.invoice?.amount === 7672, JSON.stringify(promo.data?.invoice));

    const invoices = await request('/api/billing/invoices', { cookie });
    check('lists invoices newest first', invoices.status === 200 && invoices.data?.invoices?.length === 2 && invoices.data.invoices[0].amount === 7672, JSON.stringify(invoices.data?.invoices?.map((i) => i.amount)));

    const cancelled = await request('/api/billing/cancel', { method: 'POST', cookie });
    check('cancels at period end', cancelled.status === 200 && cancelled.data?.user?.cancelAtPeriodEnd === true, `status ${cancelled.status}`);

    const resumed = await request('/api/billing/resume', { method: 'POST', cookie });
    check('resumes subscription', resumed.status === 200 && resumed.data?.user?.cancelAtPeriodEnd === false, `status ${resumed.status}`);

    const updated = await request('/api/billing/payment-method', {
      method: 'POST',
      cookie,
      body: { card: { number: '5555 5555 5555 4444', name: 'Test Runner', exp: '09/31', cvc: '321' } },
    });
    check('updates payment method', updated.status === 200 && updated.data?.user?.card?.brand === 'Mastercard' && updated.data.user.card.last4 === '4444', JSON.stringify(updated.data?.user?.card));

    const free = await request('/api/billing/checkout', { method: 'POST', cookie, body: { planId: 'free' } });
    check('downgrades to free', free.status === 200 && free.data?.user?.plan === 'free', `status ${free.status}`);

    console.log('logout');
    const logout = await request('/api/auth/logout', { method: 'POST', cookie });
    check('logs out', logout.status === 204, `status ${logout.status}`);
    const afterLogout = await request('/api/auth/session', { cookie });
    check('session invalid after logout', afterLogout.status === 401, `status ${afterLogout.status}`);

    const relogin = await request('/api/auth/login', { method: 'POST', body: { email, password: 'levelup-pass-1' } });
    check('can sign back in', relogin.status === 200 && relogin.data?.user?.email === email, `status ${relogin.status}`);
    check('session persists plan after re-login', relogin.data?.user?.plan === 'free', relogin.data?.user?.plan);

    console.log('pages');
    const page = await fetch(`${BASE}/`);
    const html = await page.text();
    check('serves app shell', page.status === 200 && html.includes('id="authGate"'), `status ${page.status}`);
    check('no stale base href', !html.includes('cloudfront.net'));

    const asset = await fetch(`${BASE}/account.js`);
    check('serves account client', asset.status === 200);
  } finally {
    server.kill('SIGTERM');
    fs.rmSync(DATA_DIR, { recursive: true, force: true });
  }

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    failures.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
