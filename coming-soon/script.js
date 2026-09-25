const signupDialog = document.getElementById('signup-dialog');
const signupForm = document.getElementById('signup-form');
const signupBody = document.getElementById('signup-body');
const signupConfirmation = document.getElementById('signup-confirmation');

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

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  signupBody.hidden = true;
  signupConfirmation.hidden = false;
});

signupDialog.addEventListener('close', () => {
  signupForm.reset();
  signupConfirmation.hidden = true;
  signupBody.hidden = false;
});
