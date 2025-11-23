// Client that talks to the backend API (Express).
// Update API_BASE if you deploy behind a different origin.
const API_BASE = '';

// ---------- Helpers ----------
function q(sel){ return document.querySelector(sel); }
function money(n){ return (Math.round(n*100)/100).toFixed(2); }
function readJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }
function writeJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function token(){ return localStorage.getItem('token') || ''; }
function authHeaders(){ return token() ? { 'Authorization': 'Bearer ' + token() } : {}; }
function alertToast(msg){ window.alert(msg); }
function goSearch(e){ e.preventDefault(); const v=(q('#searchInput')?.value||'').trim(); const u=new URL('products.html', location.href); if(v) u.hash=encodeURIComponent(v); location.href=u.toString(); return false; }

// Cart badge & auth link
function refreshBadges(){
  const cart = readJSON('cart', []);
  const count = cart.reduce((a,c)=>a+c.qty,0);
  const badge = q('#cartCount'); if(badge) badge.textContent = count;
  const user = readJSON('user', null);
  const auth = q('#authLink');
  if(auth){ auth.textContent = user ? 'Hi, ' + (user.name?.split(' ')[0] || 'User') : 'Login'; auth.href = user ? 'orders.html' : 'login.html'; }
}
document.addEventListener('DOMContentLoaded', refreshBadges);

// ---------- API ----------
async function api(path, opts={}){
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: { 'Content-Type':'application/json', ...(opts.headers||{}), ...authHeaders() }
  });
  if(!res.ok){ throw new Error((await res.json()).message || res.statusText); }
  return res.json();
}
async function loadProducts(){ return api('/api/products'); }
async function loadLabTests(){ return api('/api/labtests'); }

// ---------- Home ----------
async function mountTopSellers(){
  const el = q('#topSellers'); if(!el) return;
  const items = (await loadProducts()).slice(0,4);
  el.innerHTML = items.map(p => Card(p)).join('');
}
document.addEventListener('DOMContentLoaded', mountTopSellers);

// ---------- Components ----------
function icon(kind){ if(kind==='pill') return '💊'; if(kind==='capsule') return '💠'; if(kind==='bottle') return '🧴'; if(kind==='device') return '🩺'; return '🧪'; }
function Card(p){
  return `<article class="card">
    <div class="product-thumb">${icon(p.thumbnail)}</div>
    <h3>${p.name}</h3>
    <small class="muted">${p.brand}</small>
    <div class="price"><strong>₹${money(p.price)}</strong><span class="mrp">₹${money(p.mrp)}</span></div>
    ${p.rx_required ? '<span class="badge">Rx Required</span>' : ''}
    <div style="display:flex;gap:.5rem;margin-top:.6rem">
      <a class="btn" href="product.html#${p.slug}">Details</a>
      <button class="btn btn--primary" onclick="addToCart('${p.slug}')">Add</button>
    </div>
  </article>`;
}

// ---------- Products ----------
let allProducts = [];
async function loadAndRenderProducts(){
  allProducts = await loadProducts();
  renderProducts();
}
function renderProducts(){
  const grid = q('#productGrid'); if(!grid) return;
  const ft = (q('#filterText')?.value || '').toLowerCase();
  const fc = q('#filterCategory')?.value || '';
  const sort = q('#sortBy')?.value || '';
  let items = [...allProducts];
  const hash = decodeURIComponent(location.hash.slice(1));
  if(hash && !ft) { const inp=q('#filterText'); if(inp) inp.value = hash; }
  const term = (q('#filterText')?.value || '').toLowerCase();
  if(term) items = items.filter(p => (p.name+' '+p.brand+' '+p.category).toLowerCase().includes(term));
  if(fc) items = items.filter(p => p.category === fc);
  if(sort==='priceAsc') items.sort((a,b)=>a.price-b.price);
  if(sort==='priceDesc') items.sort((a,b)=>b.price-a.price);
  if(sort==='alpha') items.sort((a,b)=>a.name.localeCompare(b.name));
  grid.innerHTML = items.map(p => Card(p)).join('') || '<p class="muted">No products found.</p>';
}

// ---------- Product Detail ----------
async function renderProductDetail(){
  const id = location.hash.slice(1);
  const p = await api('/api/products/'+id);
  const el = q('#productDetail'); if(!el) return;
  el.innerHTML = `
    <div class="thumb">${icon(p.thumbnail)}</div>
    <div class="meta">
      <h1>${p.name}</h1>
      <div class="muted">${p.brand} • ${p.pack_size} • ${p.category}</div>
      <div class="price"><strong>₹${money(p.price)}</strong> <span class="mrp">₹${money(p.mrp)}</span></div>
      ${p.rx_required ? '<span class="badge">Rx Required</span>' : '<span class="badge">OTC</span>'}
      <p>${p.description}</p>
      <ul class="list">${p.uses.map(u=>`<li>• ${u}</li>`).join('')}</ul>
      <p><strong>Directions:</strong> ${p.directions}</p>
      <p class="muted"><strong>Safety:</strong> ${p.safety}</p>
      <div style="display:flex;gap:.6rem">
        <button class="btn btn--primary" onclick="addToCart('${p.slug}')">Add to Cart</button>
        <a class="btn" href="products.html">Back to Products</a>
      </div>
    </div>`;
}

// ---------- Cart ----------
function addToCart(slug){
  const cart = readJSON('cart', []);
  const existing = cart.find(c => c.slug===slug);
  if(existing) existing.qty += 1; else cart.push({slug, qty:1});
  writeJSON('cart', cart); refreshBadges(); alertToast('Added to cart');
}
function removeFromCart(slug){
  let cart = readJSON('cart', []);
  cart = cart.filter(c => c.slug!==slug);
  writeJSON('cart', cart);
  renderCart(); refreshBadges();
}
function changeQty(slug, d){
  const cart = readJSON('cart', []);
  const item = cart.find(c => c.slug===slug);
  if(!item) return;
  item.qty = Math.max(1, item.qty + d);
  writeJSON('cart', cart);
  renderCart(); refreshBadges();
}
async function renderCart(){
  const el = q('#cartItems'); if(!el) return;
  const cart = readJSON('cart', []);
  if(!cart.length){ el.innerHTML = '<p class="muted">Your cart is empty.</p>'; updateTotals([]); return; }
  const products = await loadProducts();
  const rows = cart.map(c => ({ ...products.find(p => p.slug===c.slug), qty:c.qty }));
  el.innerHTML = rows.map(r => `
    <div class="row">
      <div><strong>${r.name}</strong><div class="muted">${r.pack_size} • ${r.brand}</div></div>
      <div class="qty">
        <button class="btn" onclick="changeQty('${r.slug}',-1)">-</button>
        <span>${r.qty}</span>
        <button class="btn" onclick="changeQty('${r.slug}',1)">+</button>
      </div>
      <div><strong>₹${money(r.price*r.qty)}</strong><div class="muted">₹${money(r.mrp*r.qty)}</div></div>
      <button class="btn" onclick="removeFromCart('${r.slug}')">Remove</button>
    </div>`).join('');
  updateTotals(rows);
}
function updateTotals(rows){
  const subtotal = rows.reduce((a,r)=>a+r.price*r.qty,0);
  const mrp = rows.reduce((a,r)=>a+r.mrp*r.qty,0);
  const discount = Math.max(0, mrp - subtotal);
  const payable = subtotal;
  if(q('#subtotal')) q('#subtotal').textContent = money(subtotal);
  if(q('#discount')) q('#discount').textContent = money(discount);
  if(q('#payable')) q('#payable').textContent = money(payable);
}
function validateCheckout(){
  const rows = readJSON('cart', []);
  if(!rows.length){ alertToast('Your cart is empty'); return false; }
  // check rx-required products
  return true;
}

// ---------- Checkout & Orders ----------
async function placeOrder(e){
  e.preventDefault();
  const cart = readJSON('cart', []);
  if(!cart.length){ alertToast('Cart is empty'); return false; }
  const form = e.target;
  const addr = { name:q('#addrName').value, phone:q('#addrPhone').value, line:q('#addrLine').value, city:q('#addrCity').value, pincode:q('#addrPincode').value };
  const pay = (new FormData(form)).get('pay');
  try{
    const order = await api('/api/orders', { method:'POST', body: JSON.stringify({ items: cart, address: addr, payment: pay }) });
    localStorage.removeItem('cart'); refreshBadges();
    alertToast('Order placed!'); location.href = 'orders.html';
  }catch(err){ alertToast('Error: ' + err.message); }
  return false;
}
async function renderOrders(){
  try{
    const orders = await api('/api/orders');
    const el = q('#ordersList'); if(!el) return;
    if(!orders.length){ el.innerHTML = '<p class="muted">No orders yet.</p>'; return; }
    el.innerHTML = orders.map(o => `<div class="order">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>${o._id}</strong><span class="muted">${new Date(o.createdAt).toLocaleString()}</span></div>
      <div class="muted">Status: ${o.status}</div>
      <ul class="list">${o.items.map(i=>`<li>• ${i.product.name} × ${i.qty}</li>`).join('')}</ul>
      <div><strong>Total: ₹${money(o.total)}</strong></div>
    </div>`).join('');
  }catch(e){ alertToast('Please login to see orders.'); location.href='login.html'; }
}

// ---------- Auth ----------
async function doRegister(e){
  e.preventDefault();
  const user = { name: q('#rname').value, email: q('#remail').value, password: q('#rpassword').value };
  try{
    const res = await api('/api/auth/register', { method:'POST', body: JSON.stringify(user) });
    writeJSON('user', res.user); localStorage.setItem('token', res.token);
    alertToast('Account created!'); location.href = 'index.html';
  }catch(err){ alertToast('Error: ' + err.message); }
  return false;
}
async function doLogin(e){
  e.preventDefault();
  const creds = { email: q('#email').value, password: q('#password').value };
  try{
    const res = await api('/api/auth/login', { method:'POST', body: JSON.stringify(creds) });
    writeJSON('user', res.user); localStorage.setItem('token', res.token);
    alertToast('Welcome back!'); location.href = 'index.html';
  }catch(err){ alertToast('Error: ' + err.message); }
  return false;
}

// ---------- Lab Tests ----------
async function renderLabTests(){
  const grid = q('#labGrid'); if(!grid) return;
  const tests = await loadLabTests();
  grid.innerHTML = tests.map(t => `
    <article class="card">
      <h3>${t.name}</h3>
      <p class="muted">${t.parameters} parameters • TAT: ${t.report_tat}</p>
      <div class="price"><strong>₹${money(t.price)}</strong> <span class="mrp">₹${money(t.mrp)}</span></div>
      <button class="btn btn--primary" onclick="bookTest('${t.slug}')">Book Home Sample</button>
    </article>`).join('');
}
function bookTest(slug){ alertToast('Booked: ' + slug + ' (demo).'); }

// ---------- Rx Upload ----------
async function uploadRx(e){
  e.preventDefault();
  const file = q('#rxFile').files[0];
  if(!file){ alertToast('Please choose a file.'); return false; }
  const fd = new FormData(); fd.append('file', file);
  const notes = q('#notes')?.value || '';
  fd.append('notes', notes);
  const res = await fetch('/api/uploads/prescription', { method:'POST', body: fd, headers: authHeaders() });
  if(!res.ok){ const j=await res.json(); alertToast('Error: '+(j.message||res.statusText)); return false; }
  alertToast('Prescription uploaded.'); location.href = 'cart.html'; return false;
}
