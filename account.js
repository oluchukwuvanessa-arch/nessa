ocument.addEventListener('DOMContentLoaded', () => {
  const info = document.getElementById('accountInfo');
  const ordersList = document.getElementById('ordersList');
  const trackForm = document.getElementById('trackForm');
  const trackResult = document.getElementById('trackResult');
  const signOutLink = document.getElementById('signOutLink');

  const user = Store.getCurrentUser();
  if(!user){
    // redirect to login
    location.href = 'login.html';
    return;
  }

  info.innerHTML = `<strong>${user.name}</strong> <div class="small">${user.email}</div>`;

  function renderOrders(){
    const orders = Store.getOrdersByUser(user.id) || [];
    if(orders.length===0){ ordersList.innerHTML = '<p class="small">No orders yet.</p>'; return; }
    ordersList.innerHTML = '';
    orders.forEach(o => {
      const el = document.createElement('div'); el.className = 'panel';
      el.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${o.number}</strong><div class="small">${new Date(o.createdAt).toLocaleString()}</div></div>
          <div class="small">Status: <strong>${o.status}</strong></div>
        </div>
        <div style="margin-top:8px">${o.items.map(it=> `<div class="small">${it.qty}× ${it.title || it.id}</div>`).join('')}</div>
      `;
      const trackBtn = document.createElement('button'); trackBtn.className='btn'; trackBtn.textContent='Track';
      trackBtn.addEventListener('click', ()=> showOrder(o.number));
      el.appendChild(trackBtn);
      ordersList.appendChild(el);
    });
  }

  function showOrder(number){
    const o = Store.getOrderByNumber(number);
    if(!o){ trackResult.textContent = 'Order not found'; trackResult.style.color = 'crimson'; return; }
    trackResult.style.color = 'inherit';
    trackResult.innerHTML = `
      <div><strong>${o.number}</strong> • ${o.status}</div>
      <div class="small">Placed: ${new Date(o.createdAt).toLocaleString()}</div>
      <div style="margin-top:8px">${o.history ? o.history.map(h => `<div class="small">${new Date(h.when).toLocaleString()} — ${h.status}</div>`).join('') : ''}</div>
    `;
  }

  renderOrders();

  trackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const num = (new FormData(trackForm).get('number')||'').trim();
    showOrder(num);
  });

  signOutLink.addEventListener('click', (e)=>{
    e.preventDefault(); Store.signOut(); location.href='index.html';
  });
});
