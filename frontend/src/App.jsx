import { useEffect, useState } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import Forecast from './components/Forecast'
import { getWeather } from './api'

const DEFAULT = { lat: 19.076, lon: 72.8777, name: 'Mumbai, Maharashtra' }

const QUICK = [
  { lat: 28.6139, lon: 77.209, name: 'New Delhi' },
  { lat: 19.076, lon: 72.8777, name: 'Mumbai' },
  { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
  { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
  { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
  { lat: 26.9124, lon: 75.7873, name: 'Jaipur' },
]

export default function App() {
  const [place, setPlace] = useState(DEFAULT)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(p) {
    setLoading(true)
    setError(null)
    try {
      const d = await getWeather(p.lat, p.lon, p.name)
      setData(d)
    } catch {
      setError('Could not load weather. Make sure the backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(place)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.lat, place.lon])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.svg" alt="" className="brand__logo" />
          <div>
            <h1 className="brand__name">VayuScope</h1>
            <p className="brand__tag">Live weather across India</p>
          </div>
        </div>
        <SearchBar onSelect={setPlace} />
      </header>

      <div className="quick">
        {QUICK.map((c) => (
          <button
            key={c.name}
            className={`chip ${place.name.startsWith(c.name) ? 'chip--on' : ''}`}
            onClick={() => setPlace(c)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <main className="layout">
        <section className="map-card">
          <MapView place={place} onPick={setPlace} />
          <p className="map-hint">Tap anywhere on the map to read that spot’s weather.</p>
        </section>

        <aside className="panel">
          {loading && <div className="state">Loading conditions…</div>}
          {error && <div className="state state--error">{error}</div>}
          {!loading && !error && data && (
            <>
              <CurrentWeather place={place} data={data} />
              <Forecast data={data} />
            </>
          )}
        </aside>
      </main>

      <footer className="footer">
        Weather data by Open-Meteo · Map tiles © OpenStreetMap contributors
      </footer>
    </div>
  )
}
