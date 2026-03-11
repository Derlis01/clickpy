'use client'

import { Switch } from '@heroui/react'
import useCommerceStore from '@/store/commerceStore'
import { CheckoutConfiguration } from '@/types/commerceModel'
import { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { toast } from 'sonner'

const CarritoPage = () => {
  const askPaymentMethod = useCommerceStore(state => state.askPaymentMethod)
  const setAskPaymentMethod = useCommerceStore(state => state.setAskPaymentMethod)
  const checkoutConfiguration = useCommerceStore(state => state.checkoutConfiguration)
  const setCheckoutConfiguration = useCommerceStore(state => state.setCheckoutConfiguration)
  const isLoading = useCommerceStore(state => state.isLoading)
  const fetchCommerce = useCommerceStore(state => state.fetchCommerce)

  useEffect(() => {
    fetchCommerce()
  }, [fetchCommerce])

  // Función para actualizar UI inmediatamente
  const updateUI = (newConfig: CheckoutConfiguration) => {
    useCommerceStore.setState({ checkoutConfiguration: newConfig })
  }

  // Función con debounce para actualizar servidor
  const debouncedSetCheckoutConfiguration = useDebouncedCallback(async (newConfig: CheckoutConfiguration) => {
    // Toast inmediato que indica que se está guardando
    toast.loading('Guardando configuración...', {
      id: 'saving-checkout-config'
    })

    const result = await setCheckoutConfiguration(newConfig)
    // Removemos el toast de carga
    toast.dismiss('saving-checkout-config')

    if (result?.error) {
      toast.error(result.error)
      // Si hay error, revertimos al estado anterior
      fetchCommerce() // Recargar desde servidor
    } else if (result?.success) {
      toast.success('Configuración guardada', { duration: 1300 })
    }
  }, 1000)

  const handlePaymentMethodChange = (method: keyof CheckoutConfiguration['paymentMethods']) => {
    if (!checkoutConfiguration) return

    const newConfig = {
      ...checkoutConfiguration,
      paymentMethods: {
        ...checkoutConfiguration.paymentMethods,
        [method]: !checkoutConfiguration.paymentMethods[method]
      }
    }

    // Actualizamos la UI inmediatamente
    updateUI(newConfig)
    // Enviamos la actualización al servidor en segundo plano
    debouncedSetCheckoutConfiguration(newConfig)
  }

  const handleShippingMethodChange = (method: keyof CheckoutConfiguration['shippingMethods']) => {
    if (!checkoutConfiguration) return

    const newConfig = {
      ...checkoutConfiguration,
      shippingMethods: {
        ...checkoutConfiguration.shippingMethods,
        [method]: !checkoutConfiguration.shippingMethods[method]
      }
    }

    // Actualizamos la UI inmediatamente
    updateUI(newConfig)
    // Enviamos la actualización al servidor en segundo plano
    debouncedSetCheckoutConfiguration(newConfig)
  }

  return (
    <div className='w-full flex justify-center'>
      <div className='w-full max-w-[800px]'>
        <div className='md:bg-white md:rounded-xl md:shadow-sm md:my-6'>
          <h2 className='hidden md:block text-xl font-medium p-6 border-b'>Configuración de Checkout</h2>
          <div className='p-6 space-y-8'>
            {/* Métodos de pago */}
            <div className='space-y-4'>
              <div className='flex flex-col gap-1'>
                <span className='font-medium text-black'>Métodos de pago disponibles</span>
                <span className='text-pretty text-gray-500'>Selecciona qué métodos de pago mostrar en el checkout</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                      <span className='text-green-600 font-medium'>💵</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Efectivo</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.paymentMethods.cash || false}
                    onChange={() => handlePaymentMethodChange('cash')}
                  />
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-blue-600 font-medium'>📱</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Código QR</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.paymentMethods.qr || false}
                    onChange={() => handlePaymentMethodChange('qr')}
                  />
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
                      <span className='text-purple-600 font-medium'>🏦</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Transferencia</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.paymentMethods.transfer || false}
                    onChange={() => handlePaymentMethodChange('transfer')}
                  />
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                      <span className='text-orange-600 font-medium'>🔗</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Link de pago</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.paymentMethods.paymentLink || false}
                    onChange={() => handlePaymentMethodChange('paymentLink')}
                  />
                </div>
              </div>
            </div>

            {/* Métodos de envío */}
            <div className='space-y-4'>
              <div className='flex flex-col gap-1'>
                <span className='font-medium text-black'>Métodos de entrega disponibles</span>
                <span className='text-pretty text-gray-500'>
                  Selecciona qué métodos de entrega mostrar en el checkout
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                      <span className='text-green-600 font-medium'>🏪</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Retiro en tienda</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.shippingMethods.pickup || false}
                    onChange={() => handleShippingMethodChange('pickup')}
                  />
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                      <span className='text-blue-600 font-medium'>🚚</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Delivery</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.shippingMethods.delivery || false}
                    onChange={() => handleShippingMethodChange('delivery')}
                  />
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center'>
                      <span className='text-amber-600 font-medium'>🍽️</span>
                    </div>
                    <div>
                      <span className='font-medium text-black'>Comer en el lugar</span>
                    </div>
                  </div>
                  <Switch
                    isSelected={checkoutConfiguration?.shippingMethods.dinein || false}
                    onChange={() => handleShippingMethodChange('dinein')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarritoPage
