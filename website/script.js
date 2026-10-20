const FORM_ENDPOINT = 'https://formspree.io/f/mnpnbgzo';

const finePointer = window.matchMedia('(pointer: fine)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const enhance = finePointer && !coarsePointer && !reducedMotion;

/* Meta Pixel events. Every call is guarded so a blocked or failed pixel can
   never throw. No personal or health data is ever sent as a parameter. */

const trackPixel = (event, params) => {
  if (typeof fbq !== 'function') return;
  try {
    if (params) fbq('track', event, params);
    else fbq('track', event);
  } catch {
    /* an ad blocker tore the pixel down mid-call; nothing to recover */
  }
};

// Delegated so links added later are covered without rebinding
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href') || '';

  if (/^https?:\/\/(www\.)?(wa\.me|api\.whatsapp\.com)\b/i.test(href)) {
    trackPixel('Contact', { method: 'whatsapp' });
  } else if (/^tel:/i.test(href)) {
    trackPixel('Contact', { method: 'phone' });
  }
});

/* Preloader — CSS dismisses it; this only removes the node afterwards */

const preloader = document.querySelector('.preloader');
if (preloader) setTimeout(() => preloader.remove(), 1400);

/* Header + drawer */

const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');

if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => {
    const open = navDrawer.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
}

const closeDrawer = () => {
  if (!navDrawer?.classList.contains('is-open')) return;
  navDrawer.classList.remove('is-open');
  navToggle.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
};

/* Past-hero state drives the navbar theme flip and the mobile booking bar */

const hero = document.querySelector('.hero');

if (hero) {
  const watcher = new IntersectionObserver(
    ([entry]) => document.body.classList.toggle('is-past-hero', !entry.isIntersecting),
    { rootMargin: '-80px 0px 0px' }
  );
  watcher.observe(hero);
} else {
  document.body.classList.add('is-past-hero');
}

/* Active page highlight for top nav and bottom tabs */

const page = (window.location.pathname.split('/').pop() || 'index.html')
  .replace('.html', '') || 'index';

document.querySelectorAll('[data-nav]').forEach((el) => {
  el.classList.toggle('is-active', el.dataset.nav === page);
});

/* Bottom tab bar: the gold pill sits behind the tab for the current page.
   Order is Home, About, Services, Book, Contact — Book has no page of its
   own, so contact.html lights Contact (index 4) rather than Book. */

const TAB_INDEX = { index: 0, about: 1, services: 2, contact: 3 };

const tabbar = document.querySelector('.tabbar');

if (tabbar) {
  const setTab = (i) => {
    tabbar.style.setProperty('--tab-index', String(i));
    [...tabbar.querySelectorAll('.tabbar__item')].forEach((t, n) => {
      t.classList.toggle('is-active', n === i);
    });
  };

  // Book is the only tab pointing at contact.html, so the page alone decides
  setTab(TAB_INDEX[page] ?? 0);

  // Respond on tap too, before the next page paints
  [...tabbar.querySelectorAll('.tabbar__item')].forEach((tab, i) => {
    tab.addEventListener('click', () => setTab(i));
  });
}

/* A same-page #booking tap does not re-fire the browser's hash scroll, and a
   cross-page arrival lands before the fonts settle, so place it explicitly. */

if (window.location.hash === '#booking') {
  const booking = document.getElementById('booking');
  if (booking) {
    requestAnimationFrame(() => {
      booking.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }
}

/* Smooth scroll for in-page anchors */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    closeDrawer();
  });
});

/* Scroll reveal — blocks, headline wipes, line-draw dividers */

document.querySelectorAll('.reveal-text').forEach((el) => {
  if (el.childNodes.length === 1 && el.firstElementChild?.tagName === 'SPAN') return;
  const inner = document.createElement('span');
  inner.append(...el.childNodes);
  el.append(inner);
});

const revealTargets = document.querySelectorAll('.reveal, .reveal-text, .divider');

if (revealTargets.length) {
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px' }
  );
  revealTargets.forEach((el) => revealer.observe(el));
}

/* Services: highlight the category currently in view */

const svcNav = document.getElementById('svcNav');

if (svcNav) {
  const links = svcNav.querySelectorAll('a');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -45%' }
  );
  document.querySelectorAll('.svc-group').forEach((g) => spy.observe(g));
}

/* Magnetic buttons — fine pointers only */

if (enhance) {
  const PULL = 7;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const r = el.getBoundingClientRect();
      const dx = (event.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (event.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty('--mx', `${Math.max(-1, Math.min(1, dx)) * PULL}px`);
      el.style.setProperty('--my', `${Math.max(-1, Math.min(1, dy)) * PULL}px`);
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

/* 7. Cursor glow — replaces the old dot + ring. One cursor effect, not two.
   Fine pointers only, and it dims over light sections where it would read wrong. */

if (enhance) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);

  let tx = innerWidth / 2;
  let ty = innerHeight / 2;
  let gx = tx;
  let gy = ty;
  let moved = false;

  addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!moved) {
      moved = true;
      glow.classList.add('is-on');
    }
  }, { passive: true });

  // Dark sections are where the warm light belongs; elsewhere it is dialled back
  const overDark = () => {
    const el = document.elementFromPoint(gx, gy);
    if (!el) return false;
    if (document.documentElement.dataset.theme === 'dark') return true;
    return !!el.closest('.hero, .trust, .cta, .site-footer, .tabbar');
  };

  const loop = () => {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    glow.classList.toggle('is-light', !overDark());
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  addEventListener('mouseleave', () => glow.classList.remove('is-on'));
  addEventListener('mouseenter', () => { if (moved) glow.classList.add('is-on'); });
}

/* Before / after compare — the range input is the real control, so mouse,
   touch and keyboard all work without bespoke drag handling */

document.querySelectorAll('.compare').forEach((compare) => {
  const range = compare.querySelector('.compare__range');
  if (!range) return;
  const sync = () => compare.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', sync);
  sync();
});

/* Credential ticker — duplicate the track so the loop is seamless */

document.querySelectorAll('.ticker__track').forEach((track) => {
  if (track.dataset.cloned) return;
  track.dataset.cloned = 'true';
  [...track.children].forEach((item) => track.append(item.cloneNode(true)));
});

/* Booking shortcuts preselect the matching service on the enquiry form.
   The generic anchor handler above does the smooth scroll. */

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = document.getElementById('service');
    if (select) select.value = link.dataset.service;
  });
});

/* Enquiry form */

const form = document.getElementById('enquiryForm');

if (form) {
  const submitBtn = document.getElementById('enquirySubmit');
  const errorNote = document.getElementById('enquiryError');
  const doneNote = document.getElementById('enquiryDone');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorNote.hidden = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Sending…';

    const data = new FormData(form);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'New consultation request — drabhiaesthetics.com',
          source: 'Website contact form',
          name: data.get('name'),
          phone: data.get('phone'),
          service: data.get('service'),
          message: data.get('message'),
        }),
      });

      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);

      trackPixel('Lead');

      form.reset();
      form.hidden = true;
      doneNote.hidden = false;
      doneNote.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    } catch {
      errorNote.hidden = false;
    } finally {
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = 'Send Enquiry';
    }
  });
}


/* ============================================================
   Added interaction layer
   ============================================================ */

/* 1. Scroll progress — rAF-throttled, never a raw scroll handler */

const progress = document.querySelector('.progress');
const toTop = document.querySelector('.to-top');

if (progress || toTop) {
  let ticking = false;

  const onFrame = () => {
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const y = window.scrollY;
    if (progress) progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';
    if (toTop) toTop.classList.toggle('is-visible', y > window.innerHeight);
    ticking = false;
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  };

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  onFrame();
}

/* 5. Scroll to top */

if (toTop) {
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}

/* 3. Theme toggle — the saved value is applied pre-paint by the head script */

const themeToggle = document.querySelector('.theme-pill');

if (themeToggle) {
  const sync = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-checked', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  sync();

  themeToggle.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    if (dark) {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = 'dark';
    }
    try {
      localStorage.setItem('theme', dark ? 'light' : 'dark');
    } catch {
      /* private mode: the choice simply does not persist */
    }
    sync();
  });
}

/* 6. Image reveal — gold wipe, once per photo */

const photoFrames = document.querySelectorAll('.frame--photo');

if (photoFrames.length) {
  const wiper = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      wiper.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  photoFrames.forEach((f) => wiper.observe(f));
}

/* 2. Page transitions — fade out, navigate, fade in */

if (!reducedMotion) {
  const body = document.body;
  body.classList.add('page-enter');

  // The entry fade must never be what makes content visible. If the compositor
  // stalls the animation (observed: playState "running", currentTime stuck at
  // 0), animationend never fires and the page would sit at opacity 0 forever.
  // Both paths below drop the class, so the content always ends up visible.
  const reveal = () => body.classList.remove('page-enter');
  body.addEventListener('animationend', (e) => {
    if (e.animationName === 'page-in') reveal();
  });
  setTimeout(reveal, 400);
}

if (!reducedMotion) {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (/^(mailto:|tel:|https?:)/i.test(href) && link.origin !== location.origin) return;
    if (link.origin !== location.origin) return;

    // Same page (including a tab for the page you are already on): let it be
    const url = new URL(link.href);
    if (url.pathname === location.pathname) return;

    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = link.href; }, 250);
  });
}
