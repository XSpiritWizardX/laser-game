const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

const counter = document.querySelector('[data-count]');
if (counter) {
  const target = Number(counter.getAttribute('data-count'));
  const start = Math.max(target - 800, 0);
  const duration = 900;
  const startAt = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startAt) / duration, 1);
    const current = Math.floor(start + (target - start) * progress);
    counter.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

const form = document.querySelector('.waitlist-form');
const feedback = document.querySelector('.waitlist-feedback');

if (form && feedback) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailField = form.elements.email;
    const email = String(emailField.value || '').trim();

    if (!email || !emailField.checkValidity()) {
      feedback.textContent = 'Enter a valid email address to join the waitlist.';
      feedback.style.color = '#ff8b7a';
      emailField.focus();
      return;
    }

    const key = 'laser_game_waitlist_total';
    const current = Number(localStorage.getItem(key) || '12480');
    const next = current + 1;
    localStorage.setItem(key, String(next));

    feedback.textContent = `You are in. Confirmation slot #${next.toLocaleString()} reserved.`;
    feedback.style.color = '#c9ff31';

    if (counter) counter.textContent = next.toLocaleString();
    form.reset();
  });
}
