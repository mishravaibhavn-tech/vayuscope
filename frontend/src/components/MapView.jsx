import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

const INDIA_CENTER = [22.5, 79.5]
const INDIA_BOUNDS = [
  [5.5, 66.0],
  [37.5, 99.0],
]

// Branded pin (avoids Leaflet's broken default marker paths under Vite).
const pin = L.divIcon({
  className: 'vs-pin',
  html: '<span class="vs-pin__ring"></span><span class="vs-pin__dot"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onPick({
        lat: +lat.toFixed(4),
        lon: +lng.toFixed(4),
        name: `Pin · ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      })
    },
  })
  return null
}

function Recenter({ place }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([place.lat, place.lon], Math.max(map.getZoom(), 7), { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.lat, place.lon])
  return null
}

export default function MapView({ place, onPick }) {
  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={5}
      minZoom={4}
      maxBounds={INDIA_BOUNDS}
      maxBoundsViscosity={0.75}
      scrollWheelZoom
      className="leaflet-root"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[place.lat, place.lon]} icon={pin} />
      <ClickCatcher onPick={onPick} />
      <Recenter place={place} />
    </MapContainer>
  )
}
