const BASE = 'http://localhost:3001'

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Errore ${res.status}`)
  }
  return res.json()
}

window.api = {
  get:    path          => apiRequest(path),
  post:   (path, body) => apiRequest(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => apiRequest(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: path          => apiRequest(path, { method: 'DELETE' }),
}