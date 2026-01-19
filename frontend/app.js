// Waitlist functionality
const waitlistForm = document.getElementById('waitlist-form');
if (waitlistForm) {
  waitlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Send email to waitlist
  });
}

// Reveal animation
document.querySelector('.reveal').classList.add('reveal');
