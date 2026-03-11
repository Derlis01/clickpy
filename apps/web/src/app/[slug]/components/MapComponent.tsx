'use client'

import React, { useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Configurar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

interface MapComponentProps {
  center?: [number, number]
  selectedPosition?: [number, number] | null
  initialPosition?: { lat: number; lng: number }
  onLocationSelect: (lat: number, lng: number) => void
  isReadOnly?: boolean
  hasUserLocation?: boolean
  preserveZoom?: boolean
}

function MapClickHandler({
  onLocationSelect,
  isReadOnly,
  preserveZoom = false
}: {
  onLocationSelect: (lat: number, lng: number) => void
  isReadOnly?: boolean
  preserveZoom?: boolean
}) {
  const map = useMapEvents({
    click: e => {
      if (!isReadOnly) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    }
  })
  return null
}

export default function MapComponent({
  center,
  selectedPosition,
  initialPosition,
  onLocationSelect,
  isReadOnly = false,
  hasUserLocation = false,
  preserveZoom = false
}: MapComponentProps) {
  // Calculate center from props or initial position
  const mapCenter: [number, number] =
    center || (initialPosition ? [initialPosition.lat, initialPosition.lng] : [-27.345, -55.818])

  // Calculate selected position from props or initial position
  const markerPosition: [number, number] | null =
    selectedPosition || (initialPosition ? [initialPosition.lat, initialPosition.lng] : null)

  // Set zoom based on context: 17 if we have user location automatically, 10 for general view
  const zoomLevel = hasUserLocation || initialPosition ? 17 : 10

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      style={{ height: '100%', width: '100%' }}
      className='z-10'
      dragging={!isReadOnly}
      touchZoom={!isReadOnly}
      doubleClickZoom={!isReadOnly}
      scrollWheelZoom={!isReadOnly}
      boxZoom={!isReadOnly}
      keyboard={!isReadOnly}
      zoomControl={!isReadOnly}
    >
      {/* CartoDB Positron tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        subdomains='abcd'
        maxZoom={20}
      />

      <MapClickHandler onLocationSelect={onLocationSelect} isReadOnly={isReadOnly} preserveZoom={preserveZoom} />

      {/* Selected position marker */}
      {markerPosition && <Marker position={markerPosition} />}
    </MapContainer>
  )
}
