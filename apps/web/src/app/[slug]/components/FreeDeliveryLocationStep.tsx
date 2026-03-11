'use client'

import { useState } from 'react'
import { Button, Card, Chip } from '@heroui/react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, RotateCcw, CheckCircle, AlertTriangle, Gift } from 'react-feather'
import usePublicCommerceStore from '@/store/publicCommerce'
import dynamic from 'next/dynamic'
import { isLocationInCoverageZone } from '@/utils/geoUtils'
import { geoJsonForPechugon } from '@/constants/branches'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

interface FreeDeliveryLocationStepProps {
  onLocationConfirmed: (location: { lat: number; lng: number; isInCoverageZone: boolean }) => void
  onBack: () => void
}

type LocationStep = 'permission' | 'map' | 'confirmed'

export default function FreeDeliveryLocationStep({ onLocationConfirmed, onBack }: FreeDeliveryLocationStepProps) {
  const [currentStep, setCurrentStep] = useState<LocationStep>('permission')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isInZone, setIsInZone] = useState<boolean | null>(null)
  const businessColor = usePublicCommerceStore(state => state.commerce?.commercePrimaryColor)

  // Calculate text color based on background color
  const getTextColor = (backgroundColor: string) => {
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  const checkCoverageZone = (lat: number, lng: number) => {
    const inZone = isLocationInCoverageZone(lat, lng, geoJsonForPechugon)
    setIsInZone(inZone)
    return inZone
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
      checkCoverageZone(userLat, userLng)
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
    checkCoverageZone(lat, lng)
    setCurrentStep('confirmed')
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationConfirmed({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        isInCoverageZone: isInZone ?? false
      })
    }
  }

  const handleChangeLocation = () => {
    setSelectedLocation(null)
    setIsInZone(null)
    setCurrentStep('map')
  }

  if (currentStep === 'permission') {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex-1 flex flex-col justify-center px-6'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
            <div className='mb-6'>
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden'>
                {/* Pulso de fondo */}
                <motion.div
                  className='absolute inset-0 bg-green-200 rounded-full'
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
                  <Gift size={32} className='text-green-600 relative z-10' />
                </motion.div>
              </div>

              <div className='mb-4'>
                <Chip color='success' variant='flat' size='lg' className='font-semibold'>
                  🎉 ¡Envío GRATIS!
                </Chip>
              </div>

              <h3 className='text-xl font-semibold mb-3'>¿Dónde te enviamos tu pedido?</h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                Solo necesitamos tu ubicación para poder llevarte tu pedido. ¡El envío corre por nuestra cuenta!
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
              backgroundColor: businessColor || '#16a34a',
              color: getTextColor(businessColor || '#16a34a')
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
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-lg font-semibold'>Marca tu ubicación exacta</h3>
            <Chip color='success' variant='flat' size='sm'>
              Envío Gratis
            </Chip>
          </div>
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

          {/* Overlay with status indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='absolute top-4 left-4 right-4 z-30'
          >
            {isInZone ? (
              <Card className='bg-white/95 backdrop-blur-sm border border-green-200 shadow-lg'>
                <div className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                      <CheckCircle size={20} className='text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold text-green-800'>¡Estás en nuestra zona de cobertura!</p>
                      <p className='text-xs text-green-600'>Envío gratis a tu ubicación</p>
                    </div>
                    <Chip color='success' variant='flat' size='sm'>
                      Gratis
                    </Chip>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className='bg-white/95 backdrop-blur-sm border border-amber-200 shadow-lg'>
                <div className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                      <AlertTriangle size={20} className='text-amber-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold text-amber-800'>Estás fuera de nuestra zona habitual</p>
                      <p className='text-xs text-amber-700 mt-1'>
                        ¡No te preocupes! Puedes continuar con tu pedido y te asignaremos la sucursal más cercana.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
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
                backgroundColor: businessColor || '#16a34a',
                color: getTextColor(businessColor || '#16a34a')
              }}
            >
              <div className='flex items-center gap-2'>
                <span>Sí, entregar aquí</span>
              </div>
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
