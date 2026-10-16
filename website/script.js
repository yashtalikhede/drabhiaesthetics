const FORM_ENDPOINT = 'https://formspree.io/f/mnpnbgzo';

const finePointer = window.matchMedia('(pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const enhance = finePointer && !reducedMotion;

/* Preloader — CSS dismisses it on its own; this only cleans up the node */

const preloader = document.querySelector('.preloader');

if (preloader) {
  setTimeout(() => preloader.remove(), 1400);
}

/* Mobile menu */

const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');

if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
}

/* Shrink header on scroll */

if (header) {
  const syncHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
}

/* Dark hero pages: flip the header to its light treatment past the hero */

const hero = document.querySelector('.hero');

if (hero && document.body.classList.contains('has-dark-hero')) {
  const heroWatcher = new IntersectionObserver(
    ([entry]) => {
      document.body.classList.toggle('is-past-hero', !entry.isIntersecting);
    },
    { rootMargin: '-72px 0px 0px' }
  );
  heroWatcher.observe(hero);
}

/* Active nav link for the current page */

const currentPage = (window.location.pathname.split('/').pop() || 'index.html')
  .replace('.html', '') || 'index';

document.querySelectorAll('[data-nav]').forEach((link) => {
  link.classList.toggle('is-active', link.dataset.nav === currentPage);
});

/* Smooth scroll for in-page anchors */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    if (navDrawer?.classList.contains('is-open')) {
      navDrawer.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

/* Scroll reveal — blocks, headline wipes and line-draw dividers */

// Headline text is wrapped so the clip sits on the span, not on the
// observed element (a clipped node reports zero intersection area).
document.querySelectorAll('.reveal-text').forEach((el) => {
  if (el.firstElementChild?.tagName === 'SPAN' && el.childNodes.length === 1) return;
  const inner = document.createElement('span');
  inner.append(...el.childNodes);
  el.append(inner);
});

const revealTargets = document.querySelectorAll('.reveal, .reveal-text, .divider');

if (revealTargets.length) {
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px' }
  );

  revealTargets.forEach((el) => revealer.observe(el));
}

/* Highlight the service category in view */

const serviceNav = document.getElementById('serviceNav');

if (serviceNav) {
  const groups = document.querySelectorAll('.service-group');
  const navLinks = serviceNav.querySelectorAll('a');

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle(
            'is-active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: '-45% 0px -45%' }
  );

  groups.forEach((group) => spy.observe(group));
}

/* Magnetic buttons — fine pointers only */

if (enhance) {
  const PULL = 7;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      el.style.setProperty('--mx', `${Math.max(-1, Math.min(1, dx)) * PULL}px`);
      el.style.setProperty('--my', `${Math.max(-1, Math.min(1, dy)) * PULL}px`);
    });

    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

/* Custom cursor — decorative, fine pointers only, never blocks input */

if (enhance) {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);
  document.body.classList.add('has-cursor');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;

  window.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
  }, { passive: true });

  const easeRing = () => {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(easeRing);
  };
  requestAnimationFrame(easeRing);

  const interactive = 'a, button, summary, input, textarea, select, [data-magnetic]';
  document.addEventListener('mouseover', (event) => {
    if (event.target.closest(interactive)) ring.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target.closest(interactive)) ring.classList.remove('is-hovering');
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('has-cursor');
  });
  document.addEventListener('mouseenter', () => {
    document.body.classList.add('has-cursor');
  });
}

/* Before / after compare slider — the range input is the real control,
   so touch, mouse and keyboard all work without custom drag handling */

document.querySelectorAll('.compare').forEach((compare) => {
  const range = compare.querySelector('.compare__range');
  if (!range) return;

  const sync = () => compare.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', sync);
  sync();
});

/* Enquiry form */

const enquiryForm = document.getElementById('enquiryForm');

if (enquiryForm) {
  const submitButton = document.getElementById('enquirySubmit');
  const errorNote = document.getElementById('enquiryError');
  const successNote = document.getElementById('enquirySuccess');

  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorNote.hidden = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Sending…';

    const data = new FormData(enquiryForm);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: 'New consultation request — drabhiaesthetics.com',
          source: 'Website contact form',
          name: data.get('name'),
          phone: data.get('phone'),
          service: data.get('service'),
          message: data.get('message'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Formspree responded ${response.status}`);
      }

      enquiryForm.reset();
      enquiryForm.hidden = true;
      successNote.hidden = false;
      successNote.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    } catch {
      errorNote.hidden = false;
    } finally {
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = 'Send Enquiry';
    }
  });
}
