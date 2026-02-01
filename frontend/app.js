const revealNodes = document.querySelectorAll('.reveal');
const waitlistForm = document.querySelector('[data-waitlist]');
const waitlistNote = document.querySelector('[data-waitlist-note]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealNodes.forEach((node) => observer.observe(node));

if (waitlistForm) {
  waitlistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = waitlistForm.querySelector('input[type="email"]').value.trim();
    if (!email) return;
    waitlistNote.textContent = `Thanks, ${email}. You are on the list.`;
    waitlistForm.reset();
    waitlistNote.classList.add('confirmed');
    setTimeout(() => waitlistNote.classList.remove('confirmed'), 2400);
  });
}
