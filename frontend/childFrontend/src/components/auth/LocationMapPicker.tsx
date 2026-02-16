import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon in react-leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface LocationMapPickerProps {
  value: string // "lat,lng"
  onChange: (latLng: string) => void
  error?: string
  className?: string
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const DEFAULT_CENTER: [number, number] = [7.8731, 80.7718] // Sri Lanka center

export function LocationMapPicker({ value, onChange, error, className = '' }: LocationMapPickerProps) {
  const parsed = value ? value.split(',').map(Number) : []
  const valid = parsed.length === 2 && !Number.isNaN(parsed[0]) && !Number.isNaN(parsed[1])
  const [position, setPosition] = useState<[number, number]>(valid ? [parsed[0], parsed[1]] : DEFAULT_CENTER)

  useEffect(() => {
    if (value) {
      const [a, b] = value.split(',').map(Number)
      if (!Number.isNaN(a) && !Number.isNaN(b)) setPosition([a, b])
    } else {
      setPosition(DEFAULT_CENTER)
    }
  }, [value])

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onChange(`${lat},${lng}`)
  }

  return (
    <div className={className}>
      <label className="form-label">Station location on map *</label>
      <p className="small text-muted mb-2">Click on the map to mark your police station location.</p>
      <div className="rounded-3 overflow-hidden border" style={{ height: 280 }}>
        <MapContainer
          center={position}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleSelect} />
          <Marker position={position} icon={defaultIcon} />
        </MapContainer>
      </div>
      <input
        type="text"
        className="form-control form-control-sm mt-2 auth-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 7.8731,80.7718"
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  )
}
