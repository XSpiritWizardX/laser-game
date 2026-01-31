const revealElements = document.querySelectorAll('.reveal');
const waitlistForms = document.querySelectorAll('[data-waitlist]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => observer.observe(el));

waitlistForms.forEach((form) => {
  const status = form.nextElementSibling;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();

    if (!email || !email.includes('@')) {
      status.textContent = 'Add a valid email to get early access.';
      status.style.color = '#ff6a3d';
      return;
    }

    status.textContent = 'You are on the list. Watch your inbox.';
    status.style.color = '#38f2c4';
    form.reset();
  });
});
