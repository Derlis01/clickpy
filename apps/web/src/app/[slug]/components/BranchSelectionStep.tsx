'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardBody, Skeleton, Chip } from '@heroui/react'
import { MapPin, Clock, ArrowLeft, Truck } from 'react-feather'
import { motion } from 'framer-motion'
import { BRANCHES } from '@/constants/branches'
import { getRouteInfo, MapboxRoute } from '@/services/mapboxService'
import {
  calculateDeliveryPrice,
  formatDuration,
  formatDistance,
  calculateEstimatedDeliveryTime
} from '@/utils/deliveryCalculations'
import { thousandsSeparator } from '@/utils/price'
import usePublicCommerceStore from '@/store/publicCommerce'

interface BranchOption {
  id: string
  name: string
  coordinates: [number, number]
  route?: MapboxRoute
  price?: number
  isLoading: boolean
  error?: boolean
}

interface BranchSelectionStepProps {
  userLocation: [number, number]
  onBranchSelected: (branch: BranchOption) => void
  onBack: () => void
}

export default function BranchSelectionStep({ userLocation, onBranchSelected, onBack }: BranchSelectionStepProps) {
  const businessColor = usePublicCommerceStore(state => state.commerce?.commercePrimaryColor)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  useEffect(() => {
    const loadBranchData = async () => {
      const branchOptions: BranchOption[] = Object.values(BRANCHES).map(branch => ({
        ...branch,
        isLoading: true
      }))

      setBranches(branchOptions)

      // Cargar datos de rutas para cada sucursal
      for (const branch of branchOptions) {
        try {
          // userLocation viene como [lat, lng] de Leaflet, branch.coordinates también es [lat, lng]
          const route = await getRouteInfo(branch.coordinates, userLocation)

          if (route) {
            const price = calculateDeliveryPrice(route.distance)

            setBranches(prev => prev.map(b => (b.id === branch.id ? { ...b, route, price, isLoading: false } : b)))
          } else {
            setBranches(prev => prev.map(b => (b.id === branch.id ? { ...b, isLoading: false, error: true } : b)))
          }
        } catch (error) {
          setBranches(prev => prev.map(b => (b.id === branch.id ? { ...b, isLoading: false, error: true } : b)))
        }
      }
    }

    loadBranchData()
  }, [userLocation])

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId)
  }

  const handleContinue = () => {
    const branch = branches.find(b => b.id === selectedBranch)
    if (branch && !branch.isLoading && !branch.error) {
      onBranchSelected(branch)
    }
  }

  // Ordenar sucursales por precio (más barato primero)
  const sortedBranches = [...branches].sort((a, b) => {
    if (a.isLoading || a.error) return 1
    if (b.isLoading || b.error) return -1
    if (a.price === undefined) return 1
    if (b.price === undefined) return -1
    return a.price - b.price
  })

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto bg-[#F9F7F4] px-5 pt-7'>
        <div className='flex items-center gap-3 mb-6'>
          <Button isIconOnly variant='light' size='sm' onPress={onBack} className='text-gray-600'>
            <ArrowLeft size={20} />
          </Button>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold'>Elegir sucursal</h3>
            <p className='text-sm text-gray-600'>Selecciona desde qué sucursal quieres tu pedido</p>
          </div>
        </div>

        <div className='space-y-3 mb-20'>
          {sortedBranches.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                isPressable
                shadow='sm'
                onPress={() => handleBranchSelect(branch.id)}
                className={`transition-all duration-200 border-2 w-full min-h-[120px] ${
                  selectedBranch === branch.id ? 'shadow-lg' : 'border-transparent'
                }`}
                style={{
                  borderColor: selectedBranch === branch.id ? businessColor || '#2563eb' : 'transparent'
                }}
              >
                <CardBody className='p-4'>
                  <div className='flex justify-between items-start h-full'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-3'>
                        <div
                          className='w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0'
                          style={{ backgroundColor: `${businessColor || '#2563eb'}15` }}
                        >
                          <MapPin size={18} style={{ color: businessColor || '#2563eb' }} />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h4 className='font-semibold text-lg truncate'>{branch.name}</h4>
                          <p className='text-sm text-gray-500'>Sucursal</p>
                        </div>
                      </div>

                      {branch.isLoading ? (
                        <div className='space-y-2'>
                          <Skeleton className='w-32 h-3 rounded' />
                        </div>
                      ) : branch.error ? (
                        <div className='flex items-center gap-2'>
                          <Chip color='danger' size='sm' variant='flat'>
                            No disponible
                          </Chip>
                          <p className='text-xs text-red-500'>No se pudo calcular la ruta</p>
                        </div>
                      ) : null}
                    </div>

                    <div className='text-right ml-4 flex-shrink-0 flex flex-col justify-center'>
                      {branch.isLoading ? (
                        <div className='space-y-1'>
                          <Skeleton className='w-20 h-6 rounded ml-auto' />
                          <Skeleton className='w-14 h-4 rounded ml-auto' />
                        </div>
                      ) : branch.error ? (
                        <div className='flex flex-col items-end'>
                          <Chip color='danger' size='sm' variant='flat'>
                            Error
                          </Chip>
                        </div>
                      ) : branch.price !== undefined ? (
                        <div className='flex flex-col items-end'>
                          <span className='text-base font-medium text-gray-800'>
                            Gs. {thousandsSeparator(branch.price)}
                          </span>
                          <span className='text-xs text-gray-400'>Envío</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Información de delivery en una fila separada */}
                  {!branch.isLoading && !branch.error && branch.route && (
                    <div className='flex justify-between items-center mt-3'>
                      <div className='flex flex-col'>
                        <span className='text-xs text-gray-400 mb-1'>Distancia</span>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <MapPin size={12} />
                          <span>{formatDistance(branch.route.distance)}</span>
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                        <span className='text-xs text-gray-400 mb-1'>Est. entrega</span>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <Clock size={12} />
                          <span>{calculateEstimatedDeliveryTime(branch.route.duration).rangeText}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {branch.isLoading && (
                    <div className='flex justify-between items-center mt-3'>
                      <div className='flex flex-col'>
                        <Skeleton className='w-12 h-3 rounded mb-1' />
                        <Skeleton className='w-16 h-4 rounded' />
                      </div>
                      <div className='flex flex-col items-end'>
                        <Skeleton className='w-16 h-3 rounded mb-1' />
                        <Skeleton className='w-20 h-4 rounded' />
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className='sticky bottom-0 px-5 py-4 bg-[#F9F7F4] border-t border-gray-200'>
        <Button
          className='w-full max-w-full font-medium'
          size='lg'
          onPress={handleContinue}
          isDisabled={!selectedBranch || sortedBranches.find(b => b.id === selectedBranch)?.isLoading}
          style={{
            backgroundColor: businessColor || '#2563eb',
            color: '#fff',
            opacity: !selectedBranch || sortedBranches.find(b => b.id === selectedBranch)?.isLoading ? 0.5 : 1
          }}
        >
          Continuar con {selectedBranch ? sortedBranches.find(b => b.id === selectedBranch)?.name : 'sucursal'}
        </Button>
      </div>
    </div>
  )
}
