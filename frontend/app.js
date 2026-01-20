// Get elements
const form = document.getElementById('waitlist-form');
const button = form.querySelector('button');
// Add event listener
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Simulate API call or waitlist addition
  console.log('User added to waitlist.');
});
