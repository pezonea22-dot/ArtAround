if (getUser()) location.href = '/index.html'

document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px">
    <div style="width:100%;max-width:380px">
      <div style="margin-bottom:36px">
        <p style="font-size:11px;letter-spacing:.14em;color:var(--gold);text-transform:uppercase;margin-bottom:12px">
          Galleria Estense
        </p>
        <h1 class="serif" style="font-size:44px;font-weight:400;line-height:1.05">
          Art<em style="color:var(--gold)">Around</em>
        </h1>
        <p style="font-size:13px;color:var(--muted);margin-top:10px">Marketplace & Editor</p>
      </div>
      <div id="alert"></div>
      <div class="field">
        <label class="label">Username</label>
        <input id="username" class="input" type="text" placeholder="autore1">
      </div>
      <div class="field">
        <label class="label">Password</label>
        <input id="password" class="input" type="password" placeholder="••••••••">
      </div>
      <button id="loginBtn" class="btn btn-gold" style="width:100%;padding:14px;font-size:14px;margin-top:8px">
        Accedi
      </button>
      <p style="margin-top:20px;font-size:12px;color:var(--faint);text-align:center">
        autore1, autore2, visitatore1, visitatore2 · password: 12345678
      </p>
    </div>
  </div>
`

async function handleLogin() {
  const username = document.getElementById('username').value.trim()
  const password = document.getElementById('password').value
  const btn      = document.getElementById('loginBtn')
  const alertEl  = document.getElementById('alert')

  if (!username || !password) {
    alertEl.innerHTML = '<div class="alert alert-error">Inserisci username e password.</div>'
    return
  }
  btn.textContent = 'Accesso...'
  btn.disabled = true
  try {
    await doLogin(username, password)
    location.href = '/index.html'
  } catch(e) {
    alertEl.innerHTML = `<div class="alert alert-error">${e.message}</div>`
    btn.textContent = 'Accedi'
    btn.disabled = false
  }
}

document.getElementById('loginBtn').addEventListener('click', handleLogin)
document.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin() })