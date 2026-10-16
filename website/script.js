const FORM_ENDPOINT = 'https://formspree.io/f/mnpnbgzo';

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
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (navDrawer?.classList.contains('is-open')) {
      navDrawer.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

/* Reveal sections on scroll */

const revealTargets = document.querySelectorAll('.reveal');

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
      successNote.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      errorNote.hidden = false;
    } finally {
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = 'Send Enquiry';
    }
  });
}
