let museumConfig = null

export async function getMuseumConfig() {
  if (museumConfig) return museumConfig
  const res = await fetch('http://localhost:3001/museum-config')
  museumConfig = await res.json()
  return museumConfig
}