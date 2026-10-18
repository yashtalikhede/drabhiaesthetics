const FORM_ENDPOINT = 'https://formspree.io/f/mnpnbgzo';

const finePointer = window.matchMedia('(pointer: fine)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const enhance = finePointer && !coarsePointer && !reducedMotion;

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

const TAB_INDEX = { index: 0, about: 1, services: 2, contact: 4 };

const tabbar = document.querySelector('.tabbar');

if (tabbar) {
  const setTab = (i) => {
    tabbar.style.setProperty('--tab-index', String(i));
    [...tabbar.querySelectorAll('.tabbar__item')].forEach((t, n) => {
      t.classList.toggle('is-active', n === i);
    });
  };

  setTab(TAB_INDEX[page] ?? 0);

  // Respond on tap too, before the next page paints
  [...tabbar.querySelectorAll('.tabbar__item')].forEach((tab, i) => {
    tab.addEventListener('click', () => setTab(i));
  });
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

/* Custom cursor — decorative only, fine pointers only */

if (enhance) {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);
  document.body.classList.add('has-cursor');

  let tx = innerWidth / 2;
  let ty = innerHeight / 2;
  let rx = tx;
  let ry = ty;

  addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  }, { passive: true });

  const loop = () => {
    rx += (tx - rx) * 0.16;
    ry += (ty - ry) * 0.16;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const hot = 'a, button, summary, input, textarea, select, [data-magnetic]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hot)) ring.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hot)) ring.classList.remove('is-hovering');
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  document.addEventListener('mouseenter', () => document.body.classList.add('has-cursor'));
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
