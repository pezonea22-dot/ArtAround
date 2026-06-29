function getUser() {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

function getToken() {
  return localStorage.getItem('token')
}

async function doLogin(username, password) {
  const data = await window.api.post('/auth/login', { username, password })
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data.user
}

function doLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  location.href = '/login.html'
}

window.getUser  = getUser
window.getToken = getToken
window.doLogin  = doLogin
window.doLogout = doLogout