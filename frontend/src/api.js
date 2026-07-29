// VayuScope API layer.
// Weather + place search are fetched directly from the browser, so each visitor
// uses their OWN IP. This avoids the shared-hosting rate limit (HTTP 429) and
// makes weather load instantly. Lookups are still logged to our backend in the
// background so the History/SQLite feature keeps working.

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const BACKEND = import.meta.env.VITE_API_URL || 'https://vayuscope-backend.onrender.com'

const CURRENT = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day',
  'precipitation', 'rain', 'weather_code', 'cloud_cover', 'pressure_msl',
  'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
].join(',')

const DAILY = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min',
  'precipitation_sum', 'precipitation_probability_max',
  'wind_speed_10m_max', 'sunrise', 'sunset',
].join(',')

const HOURLY = ['temperature_2m', 'precipitation_probability', 'weather_code'].join(',')

export async function searchPlaces(q) {
  const url = `${GEOCODE}?name=${encodeURIComponent(q)}&count=8&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  const results = data.results || []
  const india = results.filter((x) => x.country_code === 'IN')
  return india.length ? india : results
}

export async function getWeather(lat, lon, name) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: CURRENT,
    daily: DAILY,
    hourly: HOURLY,
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  })
  const res = await fetch(`${OPEN_METEO}?${params.toString()}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()
  data.place_name = name
  logLookup(lat, lon, name, data).catch(() => {})
  return data
}

async function logLookup(lat, lon, name, data) {
  const c = (data && data.current) || {}
  await fetch(`${BACKEND}/api/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name, lat, lon,
      temperature: c.temperature_2m,
      weather_code: c.weather_code,
      wind_speed: c.wind_speed_10m,
    }),
  })
}
