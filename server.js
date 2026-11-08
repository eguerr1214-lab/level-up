'use strict';

/* ============================================================
   LEVEL UP — server
   Accounts, cookie sessions and subscription billing.
   Payment processing runs in test mode: cards are validated and
   only the brand + last 4 digits are ever stored.
   ============================================================ */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SESSION_COOKIE = 'lu_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const IS_PROD = process.env.NODE_ENV === 'production';

/* ---------- plan catalog (server is the source of truth) ---------- */
const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    tag: 'FREE',
    price: { monthly: 0, annual: 0 },
    blurb: 'Everything you need to build the habit.',
    features: ['Daily goals & streaks', 'Beginner training plan', 'Basic study planner', '1 sport focus'],
  },
  {
    id: 'plus',
    name: 'Plus',
    tag: 'MOST POPULAR',
    price: { monthly: 499, annual: 4790 },
    blurb: 'Adaptive coaching that plans around your week.',
    features: ['Everything in Starter', 'AI coach with schedule awareness', 'All training levels & sport plans', 'Flashcards, quizzes & focus timer', 'Habit insights and heatmaps'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tag: 'BEST VALUE',
    price: { monthly: 999, annual: 9590 },
    blurb: 'Full performance system for serious athletes.',
    features: ['Everything in Plus', 'Unlimited custom habits & decks', 'Weekly performance reviews', 'Recovery & mobility programming', 'Priority coach responses', 'Export your data anytime'],
  },
];

const PROMOS = {
  LEVELUP20: { percentOff: 20, label: 'Launch promo' },
};

const planById = (id) => PLANS.find((p) => p.id === id);

/* ---------- tiny JSON store ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });

function emptyDb() {
  return { users: [], sessions: {} };
}

function loadDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
    };
  } catch {
    return emptyDb();
  }
}

let db = loadDb();

function saveDb() {
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database:', err.message);
  }
}

/* ---------- password hashing ---------- */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: 64 * 1024 * 1024,
  });
  return { salt, hash: derived.toString('hex') };
}

function verifyPassword(password, user) {
  if (!user || !user.passSalt || !user.passHash) return false;
  const { hash } = hashPassword(password, user.passSalt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(user.passHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- sessions ---------- */
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.sessions[sha256(token)] = { userId, expiresAt: Date.now() + SESSION_TTL_MS };
  pruneSessions();
  saveDb();
  return token;
}

function pruneSessions() {
  const now = Date.now();
  for (const [key, session] of Object.entries(db.sessions)) {
    if (!session || session.expiresAt <= now) delete db.sessions[key];
  }
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function currentUser(req) {
  const token = parseCookies(req.headers.cookie).lu_session;
  if (!token) return null;
  const session = db.sessions[sha256(token)];
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    delete db.sessions[sha256(token)];
    saveDb();
    return null;
  }
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;
  // Sliding expiry, refreshed at most once per day.
  if (session.expiresAt - Date.now() < SESSION_TTL_MS - 24 * 60 * 60 * 1000) {
    session.expiresAt = Date.now() + SESSION_TTL_MS;
    saveDb();
  }
  return user;
}

function isHttps(req) {
  return req.secure || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function setSessionCookie(req, res, token) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req, res) {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isHttps(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

/* ---------- helpers ---------- */
function publicUser(user) {
  const plan = planById(user.plan) || PLANS[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: plan.id,
    planName: plan.name,
    cycle: user.cycle || null,
    status: user.status || 'active',
    renewsAt: user.renewsAt || null,
    cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
    card: user.card ? { brand: user.card.brand, last4: user.card.last4, exp: user.card.exp } : null,
    createdAt: user.createdAt,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function money(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

function luhn(number) {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function cardBrand(number) {
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'Amex';
  if (/^6(?:011|5)/.test(number)) return 'Discover';
  return 'Card';
}

/** Validates card input and returns a safe summary. Never stores the PAN. */
function validateCard(card) {
  const number = String(card?.number || '').replace(/[\s-]/g, '');
  const name = String(card?.name || '').trim();
  const exp = String(card?.exp || '').trim();
  const cvc = String(card?.cvc || '').trim();

  if (!/^\d{13,19}$/.test(number)) return { error: 'Enter a valid card number.' };
  if (!luhn(number)) return { error: 'That card number looks invalid.' };
  if (name.length < 2 || name.length > 60) return { error: 'Enter the name on the card.' };
  const match = /^(\d{2})\s*\/?\s*(\d{2}|\d{4})$/.exec(exp);
  if (!match) return { error: 'Use MM/YY for the expiry date.' };
  let month = Number(match[1]);
  let year = Number(match[2]);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return { error: 'Expiry month must be between 01 and 12.' };
  const now = new Date();
  const expiresEnd = new Date(year, month, 1);
  if (expiresEnd <= new Date(now.getFullYear(), now.getMonth(), 1)) return { error: 'That card has expired.' };
  if (!/^\d{3,4}$/.test(cvc)) return { error: 'Enter the 3 or 4 digit security code.' };

  return {
    card: {
      brand: cardBrand(number),
      last4: number.slice(-4),
      exp: `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`,
      name,
    },
  };
}

/* ---------- rate limiting ---------- */
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 12;

function rateLimit(req, res, next) {
  const key = `${req.ip}|${req.path}`;
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || record.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  record.count += 1;
  if (record.count > MAX_ATTEMPTS) {
    res.setHeader('Retry-After', String(Math.ceil((record.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
  }
  return next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts) if (record.resetAt <= now) attempts.delete(key);
  pruneSessions();
}, 10 * 60 * 1000).unref();

/* ---------- middleware ---------- */
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src https://fonts.gstatic.com',
      "img-src 'self' data:",
      "connect-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ')
  );
  next();
});

// Same-origin guard for state-changing requests (defence in depth on top of SameSite).
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return res.status(403).json({ error: 'Invalid origin.' });
  }
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (originHost !== host) return res.status(403).json({ error: 'Cross-origin request blocked.' });
  return next();
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: IS_PROD ? '1h' : 0 }));

/* ---------- auth API ---------- */
app.post('/api/auth/register', rateLimit, (req, res) => {
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (name.length < 2 || name.length > 40) return res.status(400).json({ error: 'Enter your name (2–40 characters).' });
  if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (password.length > 200) return res.status(400).json({ error: 'Password is too long.' });
  if (db.users.some((u) => u.emailLower === email)) {
    return res.status(409).json({ error: 'An account with that email already exists. Sign in instead.' });
  }

  const { salt, hash } = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    emailLower: email,
    passSalt: salt,
    passHash: hash,
    plan: 'free',
    cycle: null,
    status: 'active',
    renewsAt: null,
    cancelAtPeriodEnd: false,
    card: null,
    invoices: [],
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  const token = createSession(user.id);
  setSessionCookie(req, res, token);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', rateLimit, (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const user = db.users.find((u) => u.emailLower === email);
  if (!user || !verifyPassword(password, user)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  const token = createSession(user.id);
  setSessionCookie(req, res, token);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const token = parseCookies(req.headers.cookie).lu_session;
  if (token) {
    delete db.sessions[sha256(token)];
    saveDb();
  }
  clearSessionCookie(req, res);
  res.status(204).end();
});

app.get('/api/auth/session', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });
  res.json({ user: publicUser(user) });
});

app.patch('/api/auth/profile', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });
  const name = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 40) return res.status(400).json({ error: 'Enter your name (2–40 characters).' });
  user.name = name;
  saveDb();
  res.json({ user: publicUser(user) });
});

/* ---------- billing API ---------- */
app.get('/api/billing/plans', (req, res) => {
  res.json({
    plans: PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      tag: p.tag,
      blurb: p.blurb,
      features: p.features,
      price: p.price,
      priceLabel: { monthly: money(p.price.monthly), annual: money(p.price.annual) },
    })),
    testMode: true,
    currency: 'USD',
  });
});

app.post('/api/billing/checkout', rateLimit, (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to change your plan.' });

  const plan = planById(String(req.body?.planId || ''));
  const cycle = req.body?.cycle === 'annual' ? 'annual' : 'monthly';
  if (!plan) return res.status(400).json({ error: 'Choose a valid plan.' });

  if (plan.id === 'free') {
    user.plan = 'free';
    user.cycle = null;
    user.status = 'active';
    user.renewsAt = null;
    user.cancelAtPeriodEnd = false;
    saveDb();
    return res.json({ user: publicUser(user), invoice: null });
  }

  const validated = validateCard(req.body?.card);
  if (validated.error) return res.status(400).json({ error: validated.error });

  let amount = plan.price[cycle];
  let promoLabel = null;
  const promoCode = String(req.body?.promo || '').trim().toUpperCase();
  if (promoCode) {
    const promo = PROMOS[promoCode];
    if (!promo) return res.status(400).json({ error: 'That promo code is not valid.' });
    amount = Math.round(amount * (1 - promo.percentOff / 100));
    promoLabel = `${promoCode} (−${promo.percentOff}%)`;
  }

  const renewsAt = new Date();
  if (cycle === 'annual') renewsAt.setFullYear(renewsAt.getFullYear() + 1);
  else renewsAt.setMonth(renewsAt.getMonth() + 1);

  user.plan = plan.id;
  user.cycle = cycle;
  user.status = 'active';
  user.renewsAt = renewsAt.toISOString();
  user.cancelAtPeriodEnd = false;
  user.card = validated.card;

  const invoice = {
    id: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    date: new Date().toISOString(),
    description: `${plan.name} · ${cycle === 'annual' ? 'Annual' : 'Monthly'}${promoLabel ? ` · ${promoLabel}` : ''}`,
    amount,
    currency: 'usd',
    status: 'paid',
  };
  user.invoices = [invoice, ...(user.invoices || [])].slice(0, 24);
  saveDb();

  res.json({ user: publicUser(user), invoice: { ...invoice, amountLabel: money(invoice.amount) } });
});

app.post('/api/billing/payment-method', rateLimit, (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to update your payment method.' });
  const validated = validateCard(req.body?.card);
  if (validated.error) return res.status(400).json({ error: validated.error });
  user.card = validated.card;
  saveDb();
  res.json({ user: publicUser(user) });
});

app.post('/api/billing/cancel', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to manage your plan.' });
  if (user.plan === 'free') return res.status(400).json({ error: 'You are already on the free plan.' });
  user.cancelAtPeriodEnd = true;
  saveDb();
  res.json({ user: publicUser(user) });
});

app.post('/api/billing/resume', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to manage your plan.' });
  user.cancelAtPeriodEnd = false;
  saveDb();
  res.json({ user: publicUser(user) });
});

app.get('/api/billing/invoices', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to see your invoices.' });
  res.json({
    invoices: (user.invoices || []).map((inv) => ({ ...inv, amountLabel: money(inv.amount) })),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, users: db.users.length, testMode: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  console.error('Unhandled error:', err?.message || err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, HOST, () => {
  console.log(`LEVEL UP listening on http://${HOST}:${PORT}${IS_PROD ? ' (production)' : ''}`);
});
