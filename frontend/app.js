const reveals = document.querySelectorAll('.reveal');
const form = document.getElementById('waitlist-form');
const formNote = document.getElementById('form-note');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((el) => revealObserver.observe(el));

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = new FormData(form).get('email');
    if (!email) return;
    formNote.textContent = `You're on the list, ${email}! We'll be in touch.`;
    form.reset();
  });
}
