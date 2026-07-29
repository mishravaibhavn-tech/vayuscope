import { describe, windDir } from '../weatherCodes'

// Open-Meteo returns local (naive) time strings when timezone=auto,
// so we format them directly rather than converting through the browser TZ.
function localClock(iso) {
  if (!iso) return '—'
  const [datePart, timePart] = iso.split('T')
  const wd = new Date(iso)
  const day = isNaN(wd) ? '' : wd.toLocaleDateString('en-IN', { weekday: 'short' })
  return `${day} ${timePart}`.trim()
}

export default function CurrentWeather({ place, data }) {
  const c = data.current || {}
  const w = describe(c.weather_code)

  const stats = [
    { label: 'Feels like', value: `${Math.round(c.apparent_temperature)}°C` },
    { label: 'Humidity', value: `${c.relative_humidity_2m}%` },
    { label: 'Wind', value: `${Math.round(c.wind_speed_10m)} km/h ${windDir(c.wind_direction_10m)}` },
    { label: 'Gusts', value: `${Math.round(c.wind_gusts_10m)} km/h` },
    { label: 'Cloud cover', value: `${c.cloud_cover}%` },
    { label: 'Precipitation', value: `${c.precipitation} mm` },
    { label: 'Pressure', value: `${Math.round(c.pressure_msl)} hPa` },
    { label: 'Local time', value: localClock(c.time) },
  ]

  return (
    <div className="now">
      <div className="now__head">
        <div>
          <h2 className="now__place">{place.name}</h2>
          <p className="now__cond">
            <span className="now__ico">{w.icon}</span> {w.label}
          </p>
        </div>
        <div className="now__temp">
          {Math.round(c.temperature_2m)}<span>°C</span>
        </div>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat__label">{s.label}</span>
            <span className="stat__value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
