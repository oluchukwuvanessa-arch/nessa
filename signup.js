document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const result = document.getElementById('result');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name')||'').trim();
    const email = (fd.get('email')||'').trim();
    const password = (fd.get('password')||'').trim();
    try{
      if(!name || !email || !password) throw new Error('All fields are required');
      const user = Store.createUser({ name, email, password });
      // log user in
      Store.authenticate(email, password);
      result.textContent = 'Account created — you are now signed in.';
      result.style.color = 'green';
      setTimeout(() => { location.href = 'account.html'; }, 900);
    }catch(err){
      result.textContent = err.message || 'Could not create account';
      result.style.color = 'crimson';
    }
  });
});
