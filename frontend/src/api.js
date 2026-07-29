const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

export async function searchPlaces(q) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.results || []
}

export async function getWeather(lat, lon, name) {
  const url = `${BASE}/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Selected location')}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}
