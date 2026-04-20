/**
 * Login Form Handler - Modern ES6+ Implementation
 * 2026+ standards
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const resultEl = document.getElementById('result');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous messages
    resultEl.textContent = '';
    resultEl.style.display = 'none';

    try {
      const formData = new FormData(form);
      const email = (formData.get('email') || '').trim();
      const password = (formData.get('password') || '').trim();

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (email.length < 5) {
        throw new Error('Please enter a valid email address');
      }

      // Attempt authentication
      const user = Store.authenticate(email, password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Success - show message and redirect
      resultEl.textContent = '✓ Signing in... redirecting to your account.';
      resultEl.style.color = '#4caf50';
      resultEl.style.display = 'block';

      // Redirect after short delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = 'account.html';
    } catch (err) {
      resultEl.textContent = `✗ ${err.message || 'Login failed. Please try again.'}`;
      resultEl.style.color = '#f44336';
      resultEl.style.display = 'block';
      console.error('Login error:', err);
    }
  });

  // Add styles for result messages
  const style = document.createElement('style');
  style.textContent = `
    .alert {
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
});

