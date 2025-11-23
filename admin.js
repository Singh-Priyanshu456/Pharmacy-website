const API = '/api'; function token(){ return localStorage.getItem('token') || ''; }
function hdr(){ return token()? { Authorization: 'Bearer '+token(), 'Content-Type':'application/json'} : {'Content-Type':'application/json'}; }
function say(x){ alert(x); }

async function adminLogin(e){
  e.preventDefault();
  const email = document.getElementById('aEmail').value;
  const password = document.getElementById('aPass').value;
  const res = await fetch(API + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
  const j = await res.json();
  if(!res.ok){ say(j.message||'Login failed'); return false; }
  localStorage.setItem('token', j.token); say('Logged in');
  loadAll(); return false;
}

async function loadAll(){
  // list products
  const pRes = await fetch(API + '/products'); const products = await pRes.json();
  document.getElementById('pList').innerHTML = products.map(p=>`<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding:.4rem 0">
    <div><strong>${p.name}</strong><div class="muted">${p.slug}</div></div>
    <div>
      <button class="btn" onclick="fillProduct('${p.slug}')">Edit</button>
      <button class="btn" onclick="delProduct('${p.slug}')">Delete</button>
    </div></div>`).join('');

  // list lab tests
  const tRes = await fetch(API + '/labtests'); const tests = await tRes.json();
  document.getElementById('tList').innerHTML = tests.map(t=>`<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding:.4rem 0">
    <div><strong>${t.name}</strong><div class="muted">${t.slug}</div></div>
    <div>
      <button class="btn" onclick="fillTest('${t.slug}')">Edit</button>
      <button class="btn" onclick="delTest('${t.slug}')">Delete</button>
    </div></div>`).join('');
}

async function fillProduct(slug){
  const res = await fetch(API + '/products/'+slug); const p = await res.json();
  pSlug.value = p.slug; pName.value = p.name; pBrand.value = p.brand||''; pPrice.value = p.price||0; pMrp.value = p.mrp||0;
  pPack.value = p.pack_size||''; pCat.value = p.category||''; pThumb.value = p.thumbnail||''; pDesc.value = p.description||'';
  pUses.value = (p.uses||[]).join(', '); pDir.value = p.directions||''; pSafe.value = p.safety||''; pRx.checked = !!p.rx_required;
}

async function saveProduct(e){
  e.preventDefault();
  const body = {
    slug:pSlug.value, name:pName.value, brand:pBrand.value, price:parseFloat(pPrice.value||0),
    mrp:parseFloat(pMrp.value||0), pack_size:pPack.value, category:pCat.value, thumbnail:pThumb.value,
    description:pDesc.value, uses:(pUses.value||'').split(',').map(s=>s.trim()).filter(Boolean),
    directions:pDir.value, safety:pSafe.value, rx_required: pRx.checked
  };
  // decide create vs update
  const method = 'PUT'; // upsert-like: try update first
  let res = await fetch(API + '/admin/products/'+encodeURIComponent(body.slug), { method, headers: hdr(), body: JSON.stringify(body) });
  if(res.status===404){
    res = await fetch(API + '/admin/products', { method:'POST', headers: hdr(), body: JSON.stringify(body) });
  }
  const j = await res.json();
  if(!res.ok){ say(j.message||'Error saving'); return false; }
  say('Saved'); loadAll(); return false;
}
async function delProduct(slug){
  if(!confirm('Delete '+slug+'?')) return;
  const res = await fetch(API + '/admin/products/'+encodeURIComponent(slug), { method:'DELETE', headers: hdr() });
  const j = await res.json(); if(!res.ok){ say(j.message||'Error'); return; } say('Deleted'); loadAll();
}

async function fillTest(slug){
  const res = await fetch(API + '/labtests'); const tests = await res.json();
  const t = tests.find(x=>x.slug===slug); if(!t) return;
  tSlug.value = t.slug; tName.value = t.name; tPrice.value = t.price||0; tMrp.value = t.mrp||0; tTat.value = t.report_tat||''; tPrep.value = t.prep||''; tParams.value = t.parameters||0;
}
async function saveTest(e){
  e.preventDefault();
  const body = { slug:tSlug.value, name:tName.value, price:parseFloat(tPrice.value||0), mrp:parseFloat(tMrp.value||0), report_tat:tTat.value, prep:tPrep.value, parameters: parseInt(tParams.value||0) };
  let res = await fetch(API + '/admin/labtests/'+encodeURIComponent(body.slug), { method:'PUT', headers: hdr(), body: JSON.stringify(body) });
  if(res.status===404){
    res = await fetch(API + '/admin/labtests', { method:'POST', headers: hdr(), body: JSON.stringify(body) });
  }
  const j = await res.json(); if(!res.ok){ say(j.message||'Error'); return false; } say('Saved'); loadAll(); return false;
}
async function delTest(slug){
  if(!confirm('Delete '+slug+'?')) return;
  const res = await fetch(API + '/admin/labtests/'+encodeURIComponent(slug), { method:'DELETE', headers: hdr() });
  const j = await res.json(); if(!res.ok){ say(j.message||'Error'); return; } say('Deleted'); loadAll();
}

// Attempt auto-load lists if token exists
document.addEventListener('DOMContentLoaded', ()=>{ if(token()) loadAll(); });
