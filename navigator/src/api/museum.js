let museumsCache = null
let configCache = {}

export async function getMuseums() {
  if (museumsCache) return museumsCache
  const res = await fetch('http://localhost:3001/museums')
  museumsCache = await res.json()
  return museumsCache
}

export async function getMuseumConfig(museumId) {
  if (museumId && configCache[museumId]) return configCache[museumId]
  if (!museumId && configCache._default) return configCache._default

  const query = museumId ? `?id=${museumId}` : ''
  const res = await fetch(`http://localhost:3001/museum-config${query}`)
  const config = await res.json()

  if (museumId) {
    configCache[museumId] = config
  } else {
    configCache._default = config
  }
  return config
}
