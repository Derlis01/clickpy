'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Spinner } from '@heroui/react'

// Definir el tipo para las props del MapComponent
interface MapComponentProps {
  center: [number, number]
  selectedPosition: [number, number] | null
  onLocationSelect: (lat: number, lng: number) => void
  deliveryZones?: {
    type: string
    features: Array<{
      type: string
      properties: { price: number; name: string }
      geometry: {
        coordinates: number[][]
        type: string
      }
    }>
  }
  isReadOnly?: boolean
  hasUserLocation?: boolean
  preserveZoom?: boolean
}

// Importación dinámica del mapa para evitar errores de SSR
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
      <div className='flex flex-col items-center gap-4'>
        <Spinner size='lg' />
        <p className='text-gray-600'>Cargando mapa...</p>
      </div>
    </div>
  )
}) as React.ComponentType<MapComponentProps>

interface MapSelectorProps {
  initialPosition?: { lat: number; lng: number }
  onLocationSelect: (lat: number, lng: number) => void
  deliveryZones: {
    type: string
    features: Array<{
      type: string
      properties: { price: number; name: string }
      geometry: {
        coordinates: number[][]
        type: string
      }
    }>
  }
  isReadOnly?: boolean
}

const defaultCenter: [number, number] = [-27.276419, -55.7472226]

export default function MapSelector({
  initialPosition,
  onLocationSelect,
  deliveryZones,
  isReadOnly = false
}: MapSelectorProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter)
  const [isClient, setIsClient] = useState(false)
  const [hasUserLocation, setHasUserLocation] = useState(false)
  const [isManualSelection, setIsManualSelection] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (initialPosition) {
      const position: [number, number] = [initialPosition.lat, initialPosition.lng]
      setMapCenter(position)
      setSelectedPosition(position)
      setHasUserLocation(true)
    }
  }, [initialPosition])

  const handleLocationSelect = (lat: number, lng: number) => {
    if (isReadOnly) return
    setSelectedPosition([lat, lng])
    setIsManualSelection(true)
    onLocationSelect(lat, lng)
  }

  if (!isClient) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner size='lg' />
          <p className='text-gray-600'>Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full h-full relative'>
      <DynamicMap
        center={mapCenter}
        selectedPosition={selectedPosition}
        onLocationSelect={handleLocationSelect}
        deliveryZones={deliveryZones}
        isReadOnly={isReadOnly}
        hasUserLocation={hasUserLocation && !isManualSelection}
        preserveZoom={isManualSelection}
      />

      {/* Instructions - only show if not read-only */}
      {!isReadOnly && (
        <div className='absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 z-20'>
          <p className='text-sm text-gray-600 text-center'>
            📍 Toca en el mapa para seleccionar tu ubicación de entrega
          </p>
        </div>
      )}
    </div>
  )
}
