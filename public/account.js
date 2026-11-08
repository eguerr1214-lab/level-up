'use strict';

/* ============================================================
   LEVEL UP — account & billing UI
   Handles the sign-in gate, session bootstrap and the plan /
   checkout screens. The app itself (app.js) loads only once the
   visitor is authenticated or chooses demo mode.
   ============================================================ */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const gate = $('#authGate');
  const form = $('#authForm');
  const errorEl = $('#authError');
  const submitBtn = $('#authSubmit');
  const nameField = $('[data-signup-only]');
  const nameInput = $('#authName');
  const emailInput = $('#authEmail');
  const passwordInput = $('#authPassword');

  let mode = 'signin';
  let user = null;
  let appLoaded = false;
  let plans = [];
  let cycle = 'monthly';
  let selectedPlan = null;
  let checkoutMode = null; // 'subscribe' | 'update-card'
  let busy = false;

  /* ---------------- helpers ---------------- */
  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: 'same-origin',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'Something went wrong. Please try again.');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  const money = (cents) => `$${(cents / 100).toFixed(2)}`;
  const isGuest = () => !user;
  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  function showGate(nextMode = 'signin') {
    setMode(nextMode);
    gate.hidden = false;
    document.body.classList.add('auth-open');
    setTimeout(() => (nextMode === 'signup' ? nameInput : emailInput).focus(), 120);
  }

  function hideGate() {
    gate.hidden = true;
    document.body.classList.remove('auth-open');
  }

  function setMode(next) {
    mode = next;
    $$('.auth-tab').forEach((tab) => {
      const active = tab.dataset.authTab === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    nameField.hidden = mode !== 'signup';
    nameInput.required = mode === 'signup';
    passwordInput.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    submitBtn.textContent = mode === 'signup' ? 'Create free account' : 'Sign in';
    $('#authHint').innerHTML =
      mode === 'signup'
        ? 'Already have an account? <button type="button" class="auth-link" data-auth-switch="signin">Sign in</button>'
        : 'New here? <button type="button" class="auth-link" data-auth-switch="signup">Create a free account</button>';
    errorEl.textContent = '';
  }

  function setError(message) {
    errorEl.textContent = message || '';
  }

  /* ---------------- app bootstrap ---------------- */
  function bootApp(account) {
    user = account || null;
    window.LEVELUP_USER = user ? { name: user.name, email: user.email, plan: user.plan } : null;
    window.LEVELUP_STORAGE_KEY = `levelup_state_v1:${user ? user.id : 'guest'}`;
    hideGate();
    renderAccount();
    if (appLoaded) {
      location.reload();
      return;
    }
    appLoaded = true;
    const script = document.createElement('script');
    script.src = '/app.js';
    script.onload = () => {
      bindBillingRow();
      loadPlans().catch(() => {});
      loadInvoices().catch(() => {});
    };
    document.body.appendChild(script);
  }

  async function bootstrap() {
    try {
      const data = await api('/api/auth/session');
      bootApp(data.user);
    } catch {
      showGate('signin');
    }
  }

  /* ---------------- auth form ---------------- */
  $$('.auth-tab').forEach((tab) =>
    tab.addEventListener('click', () => setMode(tab.dataset.authTab))
  );

  document.addEventListener('click', (e) => {
    const swap = e.target.closest('[data-auth-switch]');
    if (swap) setMode(swap.dataset.authSwitch);
  });

  $('#authTogglePass').addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    $('#authTogglePass').textContent = show ? 'Hide' : 'Show';
    $('#authTogglePass').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    const payload =
      mode === 'signup'
        ? { name: nameInput.value.trim(), email: emailInput.value.trim(), password: passwordInput.value }
        : { email: emailInput.value.trim(), password: passwordInput.value };

    if (!payload.email || !payload.password) return setError('Enter your email and password.');
    if (mode === 'signup' && payload.name.length < 2) return setError('Enter your name so your coach knows what to call you.');
    if (mode === 'signup' && payload.password.length < 8) return setError('Use at least 8 characters for your password.');

    busy = true;
    submitBtn.disabled = true;
    submitBtn.textContent = mode === 'signup' ? 'Creating account…' : 'Signing in…';
    try {
      const data = await api(mode === 'signup' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: payload,
      });
      passwordInput.value = '';
      bootApp(data.user);
    } catch (err) {
      setError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'signup' ? 'Create free account' : 'Sign in';
    } finally {
      busy = false;
    }
  });

  $('#authDemo').addEventListener('click', () => {
    user = null;
    window.LEVELUP_USER = null;
    window.LEVELUP_STORAGE_KEY = 'levelup_state_v1:guest';
    hideGate();
    renderAccount();
    if (appLoaded) {
      location.reload();
      return;
    }
    appLoaded = true;
    const script = document.createElement('script');
    script.src = '/app.js';
    script.onload = () => {
      bindBillingRow();
      loadPlans().catch(() => {});
      loadInvoices().catch(() => {});
    };
    document.body.appendChild(script);
  });

  /* ---------------- account display ---------------- */
  function renderAccount() {
    const nameEl = $('#accountName');
    const emailEl = $('#accountEmail');
    const signOut = $('#signOutBtn');
    if (!nameEl || !emailEl) return;
    if (user) {
      nameEl.textContent = user.name;
      emailEl.textContent = user.email;
      signOut.textContent = 'Sign out';
      signOut.dataset.action = 'signout';
    } else {
      nameEl.textContent = 'Demo mode';
      emailEl.textContent = 'Progress saved on this device';
      signOut.textContent = 'Sign in';
      signOut.dataset.action = 'signin';
    }
    renderPlanBadge();
  }

  function renderPlanBadge() {
    const pill = $('#billingRowPill');
    const sub = $('#billingRowSub');
    if (!pill || !sub) return;
    if (!user) {
      pill.textContent = 'Demo';
      sub.textContent = 'Create an account to subscribe';
      return;
    }
    pill.textContent = user.planName || 'Starter';
    if (user.plan === 'free') sub.textContent = 'Free plan · upgrade anytime';
    else if (user.cancelAtPeriodEnd) sub.textContent = `Cancels ${fmtDate(user.renewsAt)}`;
    else sub.textContent = `${user.cycle === 'annual' ? 'Annual' : 'Monthly'} · renews ${fmtDate(user.renewsAt)}`;
  }

  function bindBillingRow() {
    const row = $('#billingRow');
    if (!row || row.dataset.bound) return;
    row.dataset.bound = '1';
    const open = () => {
      if (typeof window.showScreen === 'function') window.showScreen('billing');
      renderBilling();
    };
    row.addEventListener('click', open);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  document.addEventListener('click', async (e) => {
    const signOut = e.target.closest('#signOutBtn');
    if (!signOut) return;
    e.preventDefault();
    if (signOut.dataset.action === 'signin') {
      location.reload();
      return;
    }
    signOut.disabled = true;
    signOut.textContent = 'Signing out…';
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      /* cookie is cleared server-side; reload regardless */
    }
    location.reload();
  });

  /* ---------------- billing ---------------- */
  async function loadPlans() {
    if (plans.length) return plans;
    const data = await api('/api/billing/plans');
    plans = data.plans;
    return plans;
  }

  async function refreshSession() {
    try {
      const data = await api('/api/auth/session');
      user = data.user;
      renderAccount();
      return user;
    } catch {
      return null;
    }
  }

  async function renderBilling() {
    await Promise.allSettled([loadPlans(), loadInvoices()]);
    if (user) await refreshSession();
    renderCurrentPlan();
    renderPlanGrid();
    renderPlanBadge();
  }

  function renderCurrentPlan() {
    const plan = user ? plans.find((p) => p.id === user.plan) : null;
    $('#curPlanName').textContent = plan ? plan.name : user ? 'Starter' : 'Demo';
    $('#curPlanBadge').textContent = plan ? plan.tag : 'GUEST';
    $('#curPlanSub').textContent = !user
      ? 'You are exploring the demo. Create an account to keep your plan.'
      : plan && plan.id === 'free'
      ? 'Free forever. Upgrade when you want adaptive coaching.'
      : plan
      ? plan.blurb
      : 'Free plan.';

    $('#curRenew').textContent = !user ? '—' : user.plan === 'free' ? 'No renewal' : fmtDate(user.renewsAt);
    $('#curCard').textContent = user && user.card ? `${user.card.brand} ···· ${user.card.last4}` : 'None';

    const actions = $('#planActions');
    actions.innerHTML = '';
    if (!user) {
      const btn = document.createElement('button');
      btn.className = 'btn primary full sm';
      btn.textContent = 'Create an account to subscribe';
      btn.addEventListener('click', () => showGate('signup'));
      actions.appendChild(btn);
      return;
    }
    if (user.plan !== 'free') {
      if (user.cancelAtPeriodEnd) {
        const resume = document.createElement('button');
        resume.className = 'btn primary full sm';
        resume.textContent = 'Keep my plan';
        resume.addEventListener('click', () => billingAction('/api/billing/resume', 'Plan resumed.'));
        actions.appendChild(resume);
      } else {
        const cancel = document.createElement('button');
        cancel.className = 'btn ghost full sm';
        cancel.textContent = 'Cancel subscription';
        cancel.addEventListener('click', () => askCancel(cancel));
        actions.appendChild(cancel);
      }
      const update = document.createElement('button');
      update.className = 'btn ghost full sm';
      update.textContent = 'Update payment method';
      update.style.marginTop = '8px';
      update.addEventListener('click', () => openCheckout(user.plan, 'update-card'));
      actions.appendChild(update);
    }
  }

  function askCancel(button) {
    const wrap = document.createElement('div');
    wrap.className = 'confirm-box';
    wrap.innerHTML = `
      <p>Your plan stays active until ${escapeHtml(fmtDate(user.renewsAt))}. You can resume anytime.</p>
      <div class="confirm-actions">
        <button type="button" class="btn ghost sm" data-confirm="no">Keep plan</button>
        <button type="button" class="btn primary sm" data-confirm="yes">Confirm cancel</button>
      </div>`;
    button.replaceWith(wrap);
    wrap.querySelector('[data-confirm="no"]').addEventListener('click', () => renderCurrentPlan());
    wrap.querySelector('[data-confirm="yes"]').addEventListener('click', () =>
      billingAction('/api/billing/cancel', 'Subscription cancelled — active until the end of your billing period.')
    );
  }

  async function billingAction(path, successMessage) {
    try {
      const data = await api(path, { method: 'POST' });
      user = data.user;
      setStatus(successMessage, 'ok');
      renderCurrentPlan();
      renderPlanBadge();
    } catch (err) {
      setStatus(err.message, 'err');
    }
  }

  function renderPlanGrid() {
    const grid = $('#planGrid');
    grid.innerHTML = '';
    plans.forEach((plan) => {
      const price = plan.price[cycle];
      const isCurrent = user && user.plan === plan.id;
      const card = document.createElement('div');
      card.className = `plan-card${plan.id === 'plus' ? ' featured' : ''}${isCurrent ? ' current' : ''}`;
      card.innerHTML = `
        <div class="pc-top">
          <div>
            <div class="pc-name">${escapeHtml(plan.name)}</div>
            <div class="pc-price"><b>${price === 0 ? 'Free' : money(price)}</b>${price === 0 ? '' : `<span>/${cycle === 'annual' ? 'yr' : 'mo'}</span>`}</div>
          </div>
          <span class="pc-tag">${escapeHtml(plan.tag)}</span>
        </div>
        <p class="pc-blurb">${escapeHtml(plan.blurb)}</p>
        <ul class="pc-features">${plan.features
          .slice(0, 4)
          .map((f) => `<li><span>✓</span>${escapeHtml(f)}</li>`)
          .join('')}</ul>
        <button type="button" class="btn ${isCurrent ? 'ghost' : 'primary'} full sm" ${isCurrent ? 'disabled' : ''}>
          ${isCurrent ? 'Current plan' : plan.id === 'free' ? 'Switch to Starter' : `Choose ${escapeHtml(plan.name)}`}
        </button>`;
      if (!isCurrent) {
        card.querySelector('button').addEventListener('click', () => {
          if (!user) {
            setStatus('Create a free account to subscribe — it takes about 20 seconds.', 'err');
            showGate('signup');
            return;
          }
          openCheckout(plan.id, 'subscribe');
        });
      }
      grid.appendChild(card);
    });
  }

  function openCheckout(planId, checkoutType) {
    selectedPlan = plans.find((p) => p.id === planId) || null;
    checkoutMode = checkoutType || 'subscribe';
    if (!selectedPlan || selectedPlan.id === 'free') return;

    const amount = selectedPlan.price[cycle];
    const wrap = $('#checkoutWrap');
    wrap.innerHTML = `
      <div class="sec-head" style="margin-top:18px">
        <h2 class="h2">${checkoutMode === 'update-card' ? 'Update payment method' : 'Payment details'}</h2>
        <button type="button" class="link" id="closeCheckout">Close</button>
      </div>
      <div class="card checkout-card">
        <div class="order-row">
          <span>${escapeHtml(selectedPlan.name)} · ${cycle === 'annual' ? 'Annual' : 'Monthly'}</span>
          <b>${money(amount)}</b>
        </div>
        <div class="divider"></div>
        <form id="checkoutForm" novalidate>
          <label class="mini-label" for="cardNumber">Card number</label>
          <input class="mini-input" id="cardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="23" required>
          <label class="mini-label" for="cardName">Name on card</label>
          <input class="mini-input" id="cardName" autocomplete="cc-name" placeholder="${escapeHtml(user ? user.name : 'Alex Rivera')}" maxlength="60" required>
          <div class="checkout-split">
            <div>
              <label class="mini-label" for="cardExp">Expiry</label>
              <input class="mini-input" id="cardExp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="7" required>
            </div>
            <div>
              <label class="mini-label" for="cardCvc">Security code</label>
              <input class="mini-input" id="cardCvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" required>
            </div>
          </div>
          ${
            checkoutMode === 'subscribe'
              ? `<label class="mini-label" for="promo">Promo code <span class="tiny">(optional)</span></label>
                 <input class="mini-input" id="promo" placeholder="LEVELUP20" maxlength="24" autocomplete="off">`
              : ''
          }
          <p class="checkout-error" id="checkoutError" role="alert"></p>
          <button class="btn primary full" id="payBtn" type="submit">
            ${checkoutMode === 'update-card' ? 'Save payment method' : `Pay ${money(amount)}`}
          </button>
          <p class="secure-note">🔒 Test mode — card details are validated, only the last 4 digits are stored.</p>
        </form>
      </div>`;

    $('#closeCheckout').addEventListener('click', () => {
      wrap.innerHTML = '';
      selectedPlan = null;
    });

    const numberEl = $('#cardNumber');
    numberEl.addEventListener('input', () => {
      const digits = numberEl.value.replace(/\D/g, '').slice(0, 19);
      numberEl.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
    $('#cardExp').addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
      e.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });
    $('#cardCvc').addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });

    $('#checkoutForm').addEventListener('submit', submitCheckout);
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submitCheckout(e) {
    e.preventDefault();
    if (busy || !selectedPlan) return;
    const errEl = $('#checkoutError');
    errEl.textContent = '';
    const card = {
      number: $('#cardNumber').value,
      name: $('#cardName').value,
      exp: $('#cardExp').value,
      cvc: $('#cardCvc').value,
    };
    if (card.number.replace(/\D/g, '').length < 13) return (errEl.textContent = 'Enter a valid card number.');
    if (!card.name.trim()) return (errEl.textContent = 'Enter the name on the card.');
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return (errEl.textContent = 'Use MM/YY for the expiry date.');
    if (!/^\d{3,4}$/.test(card.cvc)) return (errEl.textContent = 'Enter the 3 or 4 digit security code.');

    busy = true;
    const btn = $('#payBtn');
    btn.disabled = true;
    btn.textContent = 'Processing…';
    try {
      if (checkoutMode === 'update-card') {
        const data = await api('/api/billing/payment-method', { method: 'POST', body: { card } });
        user = data.user;
        setStatus('Payment method updated.', 'ok');
      } else {
        const data = await api('/api/billing/checkout', {
          method: 'POST',
          body: {
            planId: selectedPlan.id,
            cycle,
            card,
            promo: $('#promo') ? $('#promo').value : '',
          },
        });
        user = data.user;
        setStatus(
          `You're on ${data.user.planName}. ${data.invoice ? `${data.invoice.amountLabel} charged in test mode.` : ''}`,
          'ok'
        );
      }
      $('#checkoutWrap').innerHTML = '';
      selectedPlan = null;
      renderCurrentPlan();
      renderPlanGrid();
      renderPlanBadge();
      await loadInvoices();
    } catch (err) {
      errEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = checkoutMode === 'update-card' ? 'Save payment method' : `Pay ${money(selectedPlan.price[cycle])}`;
    } finally {
      busy = false;
    }
  }

  async function loadInvoices() {
    const list = $('#invoiceList');
    const count = $('#invoiceCount');
    if (!list) return;
    if (!user) {
      list.innerHTML = '<div class="invoice-empty">Sign in to see your receipts.</div>';
      count.textContent = '0 invoices';
      return;
    }
    try {
      const data = await api('/api/billing/invoices');
      const invoices = data.invoices || [];
      count.textContent = `${invoices.length} invoice${invoices.length === 1 ? '' : 's'}`;
      if (!invoices.length) {
        list.innerHTML = '<div class="invoice-empty">No charges yet. Your first receipt will appear here.</div>';
        return;
      }
      list.innerHTML = invoices
        .map(
          (inv) => `
        <div class="invoice-row">
          <div class="inv-ico">✓</div>
          <div class="inv-body">
            <b>${escapeHtml(inv.description)}</b>
            <span>${fmtDate(inv.date)} · ${escapeHtml(inv.id)}</span>
          </div>
          <div class="inv-amt">
            <b>${escapeHtml(inv.amountLabel)}</b>
            <span>${escapeHtml(inv.status)}</span>
          </div>
        </div>`
        )
        .join('');
    } catch {
      list.innerHTML = '<div class="invoice-empty">Receipts are unavailable right now.</div>';
    }
  }

  $$('#cycleToggle button').forEach((btn) =>
    btn.addEventListener('click', () => {
      cycle = btn.dataset.cycle;
      $$('#cycleToggle button').forEach((b) => b.classList.toggle('active', b === btn));
      renderPlanGrid();
      if (selectedPlan && checkoutMode === 'subscribe') openCheckout(selectedPlan.id, 'subscribe');
    })
  );

  function setStatus(message, kind) {
    const el = $('#billStatus');
    if (!el) return;
    el.textContent = message;
    el.className = `bill-status ${kind || ''}`;
    if (message) setTimeout(() => {
      if (el.textContent === message) el.textContent = '';
    }, 6000);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------- boot ---------------- */
  document.body.classList.add('auth-open');
  bootstrap();
})();
