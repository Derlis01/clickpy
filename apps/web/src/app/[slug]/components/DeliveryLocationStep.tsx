'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Chip } from '@heroui/react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, RotateCcw } from 'react-feather'
import usePublicCommerceStore from '@/store/publicCommerce'
import dynamic from 'next/dynamic'
import BranchSelectionStep from './BranchSelectionStep'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface DeliveryLocationStepProps {
  onLocationConfirmed: (location: {
    lat: number
    lng: number
    branch: string
    price: number
    distance: number
    duration: number
  }) => void
  onBack: () => void
}

type LocationStep = 'permission' | 'map' | 'confirmed' | 'branch-selection'

export default function DeliveryLocationStep({ onLocationConfirmed, onBack }: DeliveryLocationStepProps) {
  const [currentStep, setCurrentStep] = useState<LocationStep>('permission')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const businessColor = usePublicCommerceStore(state => state.commerce?.commercePrimaryColor)

  const defaultCenter: [number, number] = [-27.345, -55.818] // [lat, lng] para Leaflet

  // Calculate text color based on background color
  const getTextColor = (backgroundColor: string) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  const handleUseLocation = async () => {
    setIsLoadingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const userLat = position.coords.latitude
      const userLng = position.coords.longitude

      setUserLocation({ lat: userLat, lng: userLng })
      setSelectedLocation({ lat: userLat, lng: userLng })
      setCurrentStep('confirmed')
    } catch (error) {
      console.error('Error getting location:', error)
      setCurrentStep('map')
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleManualLocation = () => {
    setCurrentStep('map')
  }

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setCurrentStep('confirmed')
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setCurrentStep('branch-selection')
    }
  }

  const handleChangeLocation = () => {
    setSelectedLocation(null)
    setCurrentStep('map')
  }

  const handleBranchSelected = (branch: any) => {
    if (selectedLocation && branch.route && branch.price !== undefined) {
      onLocationConfirmed({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        branch: branch.name,
        price: branch.price,
        distance: branch.route.distance,
        duration: branch.route.duration
      })
    }
  }

  const handleBackFromBranches = () => {
    setCurrentStep('confirmed')
  }

  if (currentStep === 'branch-selection' && selectedLocation) {
    return (
      <BranchSelectionStep
        userLocation={[selectedLocation.lat, selectedLocation.lng]}
        onBranchSelected={handleBranchSelected}
        onBack={handleBackFromBranches}
      />
    )
  }

  if (currentStep === 'permission') {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex-1 flex flex-col justify-center px-6'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
            <div className='mb-6'>
              <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden'>
                {/* Pulso de fondo */}
                <motion.div
                  className='absolute inset-0 bg-blue-200 rounded-full'
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />

                {/* Ícono principal con animación sutil */}
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 0.5
                  }}
                >
                  <MapPin size={32} className='text-blue-600 relative z-10' />
                </motion.div>
              </div>

              <h3 className='text-xl font-semibold mb-3'>¿Dónde te enviamos tu pedido?</h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                Necesitamos tu ubicación para asegurar que llegue directo a tu puerta
              </p>
            </div>
          </motion.div>
        </div>

        <div className='px-6 pb-6 space-y-3'>
          <Button
            isLoading={isLoadingLocation}
            className='w-full font-medium'
            size='lg'
            onPress={handleUseLocation}
            style={{
              backgroundColor: businessColor || '#2563eb',
              color: getTextColor(businessColor || '#2563eb')
            }}
          >
            <div className='flex items-center gap-2'>
              <Navigation size={18} />
              <span>Usar mi ubicación actual</span>
            </div>
          </Button>

          <Button className='w-full font-medium' size='lg' variant='bordered' onPress={handleManualLocation}>
            <span>Buscar manualmente en el mapa</span>
          </Button>

          <Button className='w-full font-medium' size='lg' variant='light' onPress={onBack}>
            <span>Volver</span>
          </Button>
        </div>
      </div>
    )
  }

  if (currentStep === 'map') {
    return (
      <div className='flex flex-col h-full'>
        <div className='px-6 py-4 border-b border-gray-200 bg-white'>
          <h3 className='text-lg font-semibold mb-2'>Marca tu ubicación exacta</h3>
          <p className='text-sm text-gray-600'>Toca el punto exacto donde quieres recibir tu pedido</p>
        </div>

        <div className='flex-1'>
          <MapComponent initialPosition={userLocation || undefined} onLocationSelect={handleMapLocationSelect} />
        </div>

        <div className='px-6 py-4 bg-white border-t border-gray-200'>
          <Button className='w-full font-medium' size='lg' variant='light' onPress={onBack}>
            <span>Volver</span>
          </Button>
        </div>
      </div>
    )
  }

  if (currentStep === 'confirmed') {
    return (
      <div className='flex flex-col h-full'>
        {/* Header with zone info */}
        <div className='px-6 py-4 bg-white border-b border-gray-200'>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold mb-1'>¿Es aquí donde quieres recibir tu pedido?</h3>
                <p className='text-sm text-gray-600'>Confirma tu ubicación de entrega</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map preview */}
        <div className='flex-1 relative'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className='h-full'
          >
            <MapComponent initialPosition={selectedLocation || undefined} onLocationSelect={handleMapLocationSelect} />
          </motion.div>

          {/* Overlay with success indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='absolute top-4 left-4 right-4 z-30'
          >
            <Card className='bg-white/95 backdrop-blur-sm border border-green-200 shadow-lg'>
              <div className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                    <MapPin size={16} className='text-green-600' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-green-800'>Tu ubicación de entrega</p>
                    <p className='text-xs text-green-600'>Toca el mapa para ajustar si es necesario</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className='px-6 py-4 bg-white border-t border-gray-200 space-y-3'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button
              className='w-full font-medium text-base'
              size='lg'
              onPress={handleConfirmLocation}
              style={{
                backgroundColor: businessColor || '#2563eb',
                color: getTextColor(businessColor || '#2563eb')
              }}
            >
              <span>Sí, entregar aquí</span>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Button className='w-full font-medium' size='lg' variant='bordered' onPress={handleChangeLocation}>
              <div className='flex items-center gap-2'>
                <RotateCcw size={18} />
                <span>Cambiar ubicación</span>
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
