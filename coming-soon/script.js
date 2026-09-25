const FORM_ENDPOINT = 'https://formspree.io/f/mnpnbgzo';

const signupDialog = document.getElementById('signup-dialog');
const signupForm = document.getElementById('signup-form');
const signupBody = document.getElementById('signup-body');
const signupConfirmation = document.getElementById('signup-confirmation');
const signupSubmit = document.getElementById('signup-submit');
const signupError = document.getElementById('signup-error');

document.querySelectorAll('[data-opens]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    document.getElementById(trigger.dataset.opens).showModal();
  });
});

document.querySelectorAll('.dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.querySelectorAll('[data-closes]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  signupError.hidden = true;
  signupSubmit.setAttribute('aria-busy', 'true');
  signupSubmit.textContent = 'Sending…';

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: document.getElementById('signup-name').value.trim(),
        email: document.getElementById('signup-email').value.trim(),
        consent: document.getElementById('signup-consent').checked,
      }),
    });

    if (!response.ok) {
      throw new Error(`Formspree responded ${response.status}`);
    }

    signupForm.reset();
    signupBody.hidden = true;
    signupConfirmation.hidden = false;
  } catch {
    signupError.hidden = false;
  } finally {
    signupSubmit.removeAttribute('aria-busy');
    signupSubmit.textContent = 'Notify Me';
  }
});

signupDialog.addEventListener('close', () => {
  signupForm.reset();
  signupError.hidden = true;
  signupConfirmation.hidden = true;
  signupBody.hidden = false;
});
