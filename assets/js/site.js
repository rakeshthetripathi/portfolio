/* thetripathi.com · revamp 2026-11 · one script for every page.
   Display panel · menu · live counters · reveal · contact and CV pop-ups (Web3Forms) · analytics events (same names as before). */
(function () {
  var doc = document, root = doc.documentElement;
  function $(id) { return doc.getElementById(id); }
  /* Every event carries site_version so the old site (v1, no tag) and the revamp (v2) can be compared in GA4 and Clarity. */
  var SITE_VERSION = 'v2';
  function track(name, params) { try { params = params || {}; params.site_version = SITE_VERSION; if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch (e) {} }
  try { if (typeof window.clarity === 'function') window.clarity('set', 'site_version', SITE_VERSION); } catch (e) {}

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Display panel: theme (local only) · text size ── */
  var THEMES = ['linen', 'ocean', 'cloud', 'holst', 'classic'], DEF = 'linen';
  var panel = $('disp'), tbtn = $('disp-btn');
  function pressed(sel, attr, val) { var b = doc.querySelectorAll(sel); for (var i = 0; i < b.length; i++) b[i].setAttribute('aria-pressed', b[i].getAttribute(attr) === val ? 'true' : 'false'); }
  function setTheme(t, save) {
    if (THEMES.indexOf(t) < 0) t = DEF;
    root.setAttribute('data-theme', t); pressed('[data-theme-pick]', 'data-theme-pick', t);
    if (save) store('rkt-theme', t);
  }
  function setText(s, save) {
    if (['m', 'l', 'xl'].indexOf(s) < 0) s = 'm';
    root.setAttribute('data-text', s); pressed('[data-text-pick]', 'data-text-pick', s);
    if (save) store('rkt-text', s);
  }
  function closeTheme() { if (panel) panel.classList.remove('open'); if (tbtn) tbtn.setAttribute('aria-expanded', 'false'); }
  window.pickTheme = function (t) { setTheme(t, true); };
  window.pickText = function (s) { setText(s, true); track('text_size_change', { event_category: 'accessibility', event_label: s }); };
  if (tbtn) tbtn.addEventListener('click', function (e) { e.stopPropagation(); var o = panel.classList.toggle('open'); tbtn.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o) { var f = panel.querySelector('[aria-pressed="true"]'); if (f) f.focus(); } });
  /* Colour themes are Rakesh's own design tool: shown on local and preview copies only. The live site always uses Linen. */
  var LIVE = /(^|\.)thetripathi\.com$/.test(location.hostname);
  if (LIVE) {
    var tp = doc.querySelectorAll('[data-theme-pick]');
    for (var ti = 0; ti < tp.length; ti++) tp[ti].parentNode.removeChild(tp[ti]);
    var dh = panel ? panel.querySelector('.dh') : null;
    if (dh && /theme/i.test(dh.textContent)) dh.parentNode.removeChild(dh);
    setTheme(DEF, false);
  } else {
    var q = (location.search.match(/[?&]theme=([a-z]+)/) || [])[1];
    setTheme(q || store('rkt-theme') || DEF, !!q);
  }
  setText(store('rkt-text') || 'm', false);

  if (!reduce) root.classList.add('snap');

  /* ── Mobile menu ── */
  var burger = $('burger'), mnav = $('mnav');
  function closeMenu() { if (mnav) mnav.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', 'false'); }
  if (burger) burger.addEventListener('click', function (e) { e.stopPropagation(); var o = mnav.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  if (mnav) mnav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  doc.addEventListener('click', function (e) {
    if (panel && panel.classList.contains('open') && !panel.contains(e.target)) closeTheme();
    if (mnav && mnav.classList.contains('open') && !mnav.contains(e.target)) closeMenu();
  });

  /* ── Menu clicks (same event as before) ── */
  var navs = doc.querySelectorAll('[data-nav]');
  for (var n = 0; n < navs.length; n++) navs[n].addEventListener('click', function () { track('nav_click', { event_category: 'navigation', event_label: this.getAttribute('data-nav') }); });

  /* ── Years since career start, so the number never goes stale ── */
  function yearsSince(ym) { var p = ym.split('-'), s = new Date(+p[0], (+p[1] || 1) - 1, 1), now = new Date(), y = now.getFullYear() - s.getFullYear(); if (now.getMonth() < s.getMonth()) y--; return y; }
  var ys = doc.querySelectorAll('[data-years-since]');
  for (var i = 0; i < ys.length; i++) { var y = yearsSince(ys[i].getAttribute('data-years-since')); ys[i].setAttribute('data-count', y); ys[i].textContent = y + (ys[i].getAttribute('data-suffix') || ''); }
  var yr = doc.querySelectorAll('[data-year]');
  for (var k = 0; k < yr.length; k++) yr[k].textContent = new Date().getFullYear();

  /* ── Count up + reveal when in view ── */
  function countUp(el) {
    var to = +el.getAttribute('data-count'), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '', t0 = null, d = 1100;
    if (reduce || !window.requestAnimationFrame || isNaN(to)) return;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / d), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v.toLocaleString('en-IN') + suf; if (p < 1) requestAnimationFrame(step); }
    el.textContent = pre + '0' + suf; requestAnimationFrame(step);
    setTimeout(function () { el.textContent = pre + to.toLocaleString('en-IN') + suf; }, d + 250); // always end on the real number
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) {
        var t = en[i].target;
        if (t.hasAttribute('data-count')) countUp(t); else t.classList.add('in');
        io.unobserve(t);
      }
    }, { threshold: 0.25 });
    var els = doc.querySelectorAll('[data-count], .reveal');
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }
  // Safety net: content must never stay hidden, even on a slow or throttled device.
  setTimeout(function () { var rv = doc.querySelectorAll('.reveal:not(.in)'); for (var r = 0; r < rv.length; r++) rv[r].classList.add('in'); }, 'IntersectionObserver' in window ? 3500 : 0);

  /* ── Case-study pages: reading progress + current chapter in the contents list ── */
  var bar = $('progress'), story = doc.querySelector('.story');
  if (bar && story) {
    var onScroll = function () {
      var r = story.getBoundingClientRect(), total = r.height - window.innerHeight * 0.6;
      bar.style.width = Math.max(0, Math.min(100, (-r.top + 64) / (total > 0 ? total : 1) * 100)) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  var tocDet = doc.querySelector('.toc details');
  if (tocDet) {
    if (window.matchMedia('(max-width: 1024px)').matches) tocDet.removeAttribute('open');
    tocDet.addEventListener('click', function (e) { if (e.target.closest('a') && window.matchMedia('(max-width: 1024px)').matches) tocDet.removeAttribute('open'); });
    var tocLinks = tocDet.querySelectorAll('a');
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (en) {
        for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) {
          for (var j = 0; j < tocLinks.length; j++) tocLinks[j].setAttribute('aria-current', tocLinks[j].getAttribute('href') === '#' + en[i].target.id ? 'true' : 'false');
        }
      }, { rootMargin: '-30% 0px -60% 0px' });
      var chs = doc.querySelectorAll('.chapter'); for (var c = 0; c < chs.length; c++) co.observe(chs[c]);
    }
  }

  /* ── Pop-up forms (shared by every page) ── */
  /* Bump ?v= whenever the CV file changes: Cloudflare keeps files for 4 hours, a new address skips the old copy. */
  var PDF = '/Rakesh-Tripathi-Resume.pdf?v=4', W3F = '3cb34389-f1e9-4cfe-ac93-3cab07a691a8';
  /* Phone number: stored reversed and split, and put together only when a thank-you message is shown, so the page source never holds it for scrapers. */
  function phone() { return ['60097', '77179', '19+'].join(' ').split('').reverse().join(''); }
  var REACH = '<span style="font-size:.82rem;opacity:.75;">Or reach me directly &nbsp;·&nbsp; <a href="mailto:rakesh@thetripathi.com" style="color:inherit;">rakesh@thetripathi.com</a> &nbsp;·&nbsp; <span class="ph">' + phone() + '</span></span>';
  var REASONS = ['Hiring / Recruitment', 'Collaboration / Partnership', 'Professional Reference', 'Academic / Research', 'Mentorship / Advisory', 'Other'];
  var opts = '<option value="">Select a reason…</option>';
  for (var o = 0; o < REASONS.length; o++) opts += '<option>' + REASONS[o] + '</option>';
  var wrap = doc.createElement('div');
  wrap.innerHTML =
    '<div class="modal-overlay" id="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title"><div class="modal">' +
      '<button type="button" class="modal-close" data-close="contact-modal" aria-label="Close">✕</button>' +
      '<div class="modal-head" id="contact-modal-header"><h3 id="contact-title">Let\'s talk</h3><p>Send me a message and I\'ll get back to you within 24–48 hours.</p></div>' +
      '<form id="contact-form">' +
        '<div class="form-field"><label for="c-name">Your name *</label><input id="c-name" type="text" name="name" placeholder="Your full name" required autocomplete="name"></div>' +
        '<div class="form-field"><label for="c-email">Your email *</label><input id="c-email" type="email" name="email" placeholder="your@email.com" required autocomplete="email"></div>' +
        '<div class="form-field"><label for="c-msg">Your message *</label><textarea id="c-msg" name="message" placeholder="Tell me what\'s on your mind…" required></textarea></div>' +
        '<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit" class="btn-submit">Send message →</button>' +
      '</form><div class="form-success" id="contact-success" aria-live="polite"></div></div></div>' +
    '<div class="modal-overlay" id="resume-modal" role="dialog" aria-modal="true" aria-labelledby="resume-title"><div class="modal">' +
      '<button type="button" class="modal-close" data-close="resume-modal" aria-label="Close">✕</button>' +
      '<div class="modal-head" id="resume-modal-header"><h3 id="resume-title">One quick step</h3><p>To make sure my CV reaches the right hands, I\'d love to know a little about you first.</p></div>' +
      '<form id="resume-form">' +
        '<div class="form-field"><label for="r-name">Your name *</label><input id="r-name" type="text" name="name" placeholder="Your full name" required autocomplete="name"></div>' +
        '<div class="form-field"><label for="r-email">Your email *</label><input id="r-email" type="email" name="email" placeholder="your@email.com" required autocomplete="email"></div>' +
        '<div class="form-field"><label for="r-org">Organisation / company</label><input id="r-org" type="text" name="organization" placeholder="Where are you from?" autocomplete="organization"></div>' +
        '<div class="form-field"><label for="r-reason">Reason for downloading *</label><select id="r-reason" name="reason" required>' + opts + '</select></div>' +
        '<input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit" class="btn-submit">Download CV →</button>' +
      '</form><div class="form-success" id="resume-success" aria-live="polite"></div></div></div>';
  while (wrap.firstChild) doc.body.appendChild(wrap.firstChild);

  var lastFocus = null;
  function openModal(id, btnText) {
    var el = $(id), form = el.querySelector('form'), ok = el.querySelector('.form-success'), head = el.querySelector('.modal-head'), b = form.querySelector('button[type="submit"]');
    form.reset(); form.style.display = ''; head.style.display = ''; ok.style.display = 'none'; ok.innerHTML = '';
    b.disabled = false; b.textContent = btnText;
    lastFocus = doc.activeElement; el.classList.add('open'); doc.body.style.overflow = 'hidden';
    setTimeout(function () { var f = form.querySelector('input'); if (f) f.focus(); }, 60);
  }
  function closeModal(id) { var el = $(id); if (!el) return; el.classList.remove('open'); doc.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  window.openContactModal = function (e) { if (e && e.preventDefault) e.preventDefault(); track('contact_modal_open', { event_category: 'engagement', event_label: 'Send Me a Message' }); openModal('contact-modal', 'Send message →'); };
  window.openResumeModal = function (e) { if (e && e.preventDefault) e.preventDefault(); closeMenu(); track('cv_modal_open', { event_category: 'engagement', event_label: 'Download CV' }); openModal('resume-modal', 'Download CV →'); };
  window.closeModal = closeModal;
  doc.addEventListener('click', function (e) {
    var c = e.target.closest('[data-close]'); if (c) closeModal(c.getAttribute('data-close'));
    if (e.target.classList && e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
    var op = e.target.closest('[data-open]'); if (op) { if (op.getAttribute('data-open') === 'contact') window.openContactModal(e); else window.openResumeModal(e); }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal('contact-modal'); closeModal('resume-modal'); closeTheme(); closeMenu(); } });

  function firstName(n) { return n ? n.trim().split(' ')[0] : ''; }
  function stamp() { return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }); }
  function send(data, onOk, onFail) {
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (r.ok) onOk(); else onFail(); })['catch'](onFail);
  }
  $('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, b = f.querySelector('button[type="submit"]');
    if (!f.checkValidity()) { f.reportValidity(); return; }
    if (f.botcheck.checked) return;
    var data = { name: f.name.value, email: f.email.value, message: f.message.value, timestamp: stamp(), access_key: W3F, subject: 'New Portfolio Message from ' + (f.name.value || 'Visitor'), from_name: 'Portfolio Site' };
    b.disabled = true; b.textContent = 'Sending…';
    send(data, function () {
      track('contact_form_submit', { event_category: 'conversion', event_label: 'Contact Form' });
      f.style.display = 'none'; $('contact-modal-header').style.display = 'none';
      var ok = $('contact-success');
      ok.innerHTML = '<div class="ty-check">✓</div><div class="ty-title">Thank you' + (firstName(data.name) ? ', ' + firstName(data.name) : '') + '!</div><div class="ty-sub">Your message is with me. I\'ll get back to you within 24–48 hours.<br><br>' + REACH + '</div>';
      ok.style.display = 'block';
    }, function () { b.disabled = false; b.textContent = 'Send message →'; track('form_submit_error', { event_category: 'conversion', event_label: 'Contact Form' }); alert('Something went wrong. Please try again.'); });
  });
  $('resume-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, b = f.querySelector('button[type="submit"]');
    if (!f.checkValidity()) { f.reportValidity(); return; }
    if (f.botcheck.checked) return;
    var data = { name: f.name.value, email: f.email.value, organization: f.organization.value, reason: f.reason.value, timestamp: stamp(), access_key: W3F, subject: 'CV Download Request: ' + (f.name.value || 'Visitor'), from_name: 'Portfolio Site' };
    b.disabled = true; b.textContent = 'Processing…';
    send(data, function () {
      track('cv_download', { event_category: 'conversion', event_label: 'CV Downloaded' });
      f.style.display = 'none'; $('resume-modal-header').style.display = 'none';
      var ok = $('resume-success');
      ok.innerHTML = '<div class="ty-check">✓</div><div class="ty-title">You\'re all set' + (firstName(data.name) ? ', ' + firstName(data.name) : '') + '!</div><div class="ty-sub">Thank you for taking the time — it genuinely means a lot.<br>I hope my work resonates, and I look forward to connecting with you.</div><a class="btn btn-solid ty-cv" href="' + PDF + '" target="_blank" rel="noopener" data-track="cv_open_click|conversion|Thank-you button">Open my CV &#8599;</a><div class="ty-sub">' + REACH + '</div>';
      ok.style.display = 'block';
      setTimeout(function () { window.open(PDF, '_blank'); }, 600);
    }, function () { b.disabled = false; b.textContent = 'Download CV →'; track('form_submit_error', { event_category: 'conversion', event_label: 'CV Form' }); alert('Something went wrong. Please try again.'); });
  });

  /* ── Other events kept from the old site ── */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('[data-track]'); if (!a) return;
    var t = a.getAttribute('data-track').split('|');
    track(t[0], { event_category: t[1] || 'engagement', event_label: t[2] || '' });
  });
  /* Internal links in the page body that have no event of their own (industry cards, breadcrumbs, chapter list, "See all work"…). */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('main a[href]'); if (!a || a.closest('[data-track],[data-nav],[data-open]')) return;
    var h = a.getAttribute('href'); if (!/^[\/#]/.test(h)) return;
    var sec = a.closest('section'), where = a.closest('.toc') ? 'contents' : a.closest('.crumb') ? 'breadcrumb' : (sec && (sec.id || sec.getAttribute('aria-labelledby') || sec.className.split(' ')[0])) || 'page';
    track('internal_link_click', { event_category: 'navigation', event_label: (a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60), link_url: h, section: where });
  });
  (function () {
    var fired = {}, marks = [25, 50, 75, 100];
    window.addEventListener('scroll', function () {
      var h = root.scrollHeight - window.innerHeight, d = h > 0 ? Math.round((window.scrollY || root.scrollTop) / h * 100) : 0;
      for (var i = 0; i < marks.length; i++) if (d >= marks[i] && !fired[marks[i]]) { fired[marks[i]] = 1; track('scroll_depth', { event_category: 'engagement', event_label: marks[i] + '%', value: marks[i] }); }
    }, { passive: true });
  })();
})();
