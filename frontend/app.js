const revealEls = document.querySelectorAll('.reveal');

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealEls.forEach((el) => io.observe(el));

const form = document.getElementById('waitlistForm');
const email = document.getElementById('email');
const msg = document.getElementById('waitlistMsg');
let waitlistCount = 1287;

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!email.checkValidity()) {
    msg.textContent = 'Enter a valid email to join the waitlist.';
    email.focus();
    return;
  }

  const btn = form.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = 'Processing...';
  msg.textContent = 'Securing your position...';

  await new Promise((resolve) => setTimeout(resolve, 700));

  waitlistCount += 1;
  msg.textContent = `You are in. Position #${waitlistCount.toLocaleString()}.`;
  form.reset();
  btn.disabled = false;
  btn.textContent = 'Request Invite';
});

document.querySelectorAll('[data-plan]').forEach((button) => {
  button.addEventListener('click', () => {
    const plan = button.getAttribute('data-plan');
    msg.textContent = `${plan} selected. Enter your email for priority access.`;
    document.getElementById('cta').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
