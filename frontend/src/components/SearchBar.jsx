import { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../api'

export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const r = await searchPlaces(q.trim())
        setResults(r)
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    function onDoc(e) {
      if (box.current && !box.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function choose(r) {
    const label = [r.name, r.admin1].filter(Boolean).join(', ')
    onSelect({ lat: r.latitude, lon: r.longitude, name: label })
    setQ(label)
    setOpen(false)
  }

  return (
    <div className="search" ref={box}>
      <span className="search__icon">🔍</span>
      <input
        className="search__input"
        placeholder="Search a city, state or town…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="search__list">
          {results.map((r) => (
            <li key={r.id} className="search__item" onClick={() => choose(r)}>
              <span className="search__name">{r.name}</span>
              <span className="search__meta">
                {[r.admin1, r.country].filter(Boolean).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
