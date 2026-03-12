'use client'

import { useState, useEffect } from 'react'
import { RadioGroup, Radio, Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'react-feather'
import usePublicCart from '@/store/publicCart'
import usePublicCommerceStore from '@/store/publicCommerce'
import { Order } from '@/types/Checkout'
import { saveOrder } from '@/services/checkoutService'
import { thousandsSeparator } from '@/utils/price'
import { useDisclosure } from '@heroui/react'
import ModalUserInfo from './ModalUserInfo'
import DeliveryLocationStep from './DeliveryLocationStep'
import FreeDeliveryLocationStep from './FreeDeliveryLocationStep'
import { DELIVERY_WHITELIST, FREE_DELIVERY_WHITELIST } from '@/constants/branches'

export function generateWhatsAppMessage(
  order: Order,
  deliveryType: string,
  paymentMethod: string,
  deliveryLocation?: {
    lat: number
    lng: number
    branch: string
    price: number
    distance: number
    duration: number
  },
  freeDeliveryLocation?: {
    lat: number
    lng: number
    isInCoverageZone: boolean
  }
): string {
  const { customerName, customerPhone, products, total, currency } = order

  const formatProduct = (product: any) => {
    const lines = []

    // Product header without number
    lines.push(`*${product.quantity}x ${product.productName}*`)
    lines.push(`   Precio unitario: Gs. ${thousandsSeparator(product.price || 0)}`)

    // Show selected option if exists
    if (product.selections?.selectedOption) {
      lines.push(
        `   Opción: ${product.selections.selectedOption.name} (+Gs. ${thousandsSeparator(product.selections.selectedOption.price)})`
      )
    }

    // Show selected addons if exist
    if (product.selections?.selectedAddons?.length > 0) {
      product.selections.selectedAddons.forEach((addon: any) => {
        if (addon.price > 0) {
          lines.push(`   ${addon.name} (+Gs. ${thousandsSeparator(addon.price)})`)
        } else {
          lines.push(`   ${addon.name} (Incluido)`)
        }
      })
    }

    // Subtotal per item
    lines.push(`   *Subtotal: Gs. ${thousandsSeparator(product.total)}*`)

    return lines.join('\n')
  }

  let deliveryDetails = ''
  if (deliveryType === 'pickup') {
    deliveryDetails = '• Tipo: Retiro en tienda'
  } else if (deliveryType === 'delivery') {
    if (freeDeliveryLocation) {
      // Para comercios con delivery gratis (Pechugon)
      const zoneStatus = freeDeliveryLocation.isInCoverageZone
        ? '✅ Dentro de zona de cobertura'
        : '⚠️ Fuera de zona - Asignar sucursal cercana'
      deliveryDetails = `• Tipo: Delivery
• Costo de envío: ¡GRATIS!
• ${zoneStatus}
• Ubicación: https://maps.google.com/?q=${freeDeliveryLocation.lat},${freeDeliveryLocation.lng}`
    } else if (deliveryLocation) {
      // Para comercios en whitelist con información detallada
      deliveryDetails = `• Tipo: Delivery
• Sucursal: ${deliveryLocation.branch}
• Costo de envío: Gs. ${thousandsSeparator(deliveryLocation.price)}
• Ubicación: https://maps.google.com/?q=${deliveryLocation.lat},${deliveryLocation.lng}`
    } else {
      // Para comercios fuera de whitelist, delivery simple
      deliveryDetails = '• Tipo: Delivery'
    }
  } else if (deliveryType === 'dinein') {
    deliveryDetails = '• Tipo: Consumir en local'
  }

  const subtotal = products.reduce((acc: number, product: any) => acc + product.total, 0)
  const deliveryCost = deliveryType === 'delivery' && deliveryLocation ? deliveryLocation.price : 0

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'qr':
        return 'Pago QR'
      case 'transfer':
        return 'Transferencia Bancaria'
      case 'paymentLink':
        return 'Link de Pago'
      default:
        return 'Efectivo'
    }
  }

  const paymentMethodText = getPaymentMethodText(paymentMethod)

  const message = `👋 Hola! Quisiera hacer un pedido:

*👤 DATOS DEL CLIENTE*
• Nombre: ${customerName}
• Teléfono: ${customerPhone}

*🛍️ DETALLE DEL PEDIDO*
${products.map(formatProduct).join('\n\n- - - - - - - - - -\n\n')}

━━━━━━━━━━━━━━━━━━━━
*RESUMEN DEL PEDIDO*
Subtotal productos: Gs. ${thousandsSeparator(subtotal)}

*💳 MÉTODO DE PAGO*
• ${paymentMethodText}

*🚚 DETALLES DE ENTREGA*
${deliveryDetails}

*💰 TOTAL A PAGAR*
Productos: Gs. ${thousandsSeparator(subtotal)}${deliveryCost > 0 ? `\nEnvío: Gs. ${thousandsSeparator(deliveryCost)}` : ''}
━━━━━━━━━━━━━━━━━━━━
*TOTAL FINAL: ${currency} ${thousandsSeparator(total)}*`.trim()

  return message
}

// Improved helper function for WhatsApp URL handling with better emoji support
function openWhatsAppWithFallback(phone: string, message: string): void {
  const encodedMessage = encodeURIComponent(message)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')

  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  const nativeUrl = `whatsapp://send?phone=${phone}&text=${encodedMessage}`

  // Use official WhatsApp API instead of wa.me for better emoji support
  const webUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`

  // Detect Instagram WebView and fallback directly to web
  if (/Instagram/i.test(navigator.userAgent)) {
    window.open(webUrl, '_blank')
    return
  }

  if (isMobile) {
    // Set timeout for fallback to web version
    const fallbackTimeout = window.setTimeout(() => {
      window.open(webUrl, '_blank')
    }, 1500) // Increased timeout to 1.5 seconds

    // Cancel fallback if page becomes hidden (app opened)
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(fallbackTimeout)
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Try to open native app using link click approach
    const link = document.createElement('a')
    link.href = nativeUrl
    link.target = '_blank'
    link.rel = 'noopener'
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    // Desktop: use official API for better emoji support
    window.open(webUrl, '_blank')
  }
}

type StepType = 'delivery-type' | 'delivery-location' | 'user-info'

export default function CartResumeStepTwo({ onCloseCart }: { onCloseCart: () => void }) {
  const setOrderPreferences = usePublicCart(state => state.setOrderPreferences)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [deliveryType, setDeliveryType] = useState('')
  const businessColor = usePublicCommerceStore(state => state.commerce?.commercePrimaryColor)
  const [isOrderSaving, setIsOrderSaving] = useState(false)
  const commercePhone = usePublicCommerceStore(state => state.commerce?.commercePhone)
  const commerceSlug = usePublicCommerceStore(state => state.commerce?.commerceSlug)
  const commerce = usePublicCommerceStore(state => state.commerce)

  // Default payment and shipping methods for backward compatibility
  const defaultPaymentMethods = {
    cash: true,
    transfer: true,
    qr: false,
    paymentLink: false
  }

  const defaultShippingMethods = {
    pickup: true,
    delivery: true,
    dinein: false
  }

  // Use commerce methods if available, otherwise use defaults
  const paymentMethods = commerce?.paymentMethods || defaultPaymentMethods
  const shippingMethods = commerce?.shippingMethods || defaultShippingMethods

  // Check if commerce is in delivery whitelist
  const isDeliveryEnabled = commerceSlug ? DELIVERY_WHITELIST.includes(commerceSlug) : false

  // Check if commerce has free delivery (Pechugon)
  const isFreeDeliveryEnabled = commerceSlug ? FREE_DELIVERY_WHITELIST.includes(commerceSlug) : false

  const commerceCustomer = usePublicCart(state => state.commerceCustomer)
  const products = usePublicCart(state => state.products)
  const clearProducts = usePublicCart(state => state.clearProducts)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [userInfoCompleted, setUserInfoCompleted] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepType>('delivery-type')
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number
    lng: number
    branch: string
    price: number
    distance: number
    duration: number
  } | null>(null)

  // Estado para delivery gratis (Pechugon)
  const [freeDeliveryLocation, setFreeDeliveryLocation] = useState<{
    lat: number
    lng: number
    isInCoverageZone: boolean
  } | null>(null)

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
    setOrderPreferences({
      deliveryType: deliveryType,
      serviceType: '',
      paymentMethod: value
    })
  }

  const handleDeliveryChange = (value: string) => {
    setDeliveryType(value)
    setOrderPreferences({
      deliveryType: value,
      serviceType: '',
      paymentMethod: paymentMethod
    })
  }

  const handleLocationConfirmed = (location: {
    lat: number
    lng: number
    branch: string
    price: number
    distance: number
    duration: number
  }) => {
    setDeliveryLocation(location)
    setCurrentStep('user-info')
    onOpen()
  }

  // Handler para delivery gratis (Pechugon)
  const handleFreeDeliveryLocationConfirmed = (location: { lat: number; lng: number; isInCoverageZone: boolean }) => {
    setFreeDeliveryLocation(location)
    setCurrentStep('user-info')
    onOpen()
  }

  const handleBackToDeliveryType = () => {
    setCurrentStep('delivery-type')
    setDeliveryType('')
    setDeliveryLocation(null)
    setFreeDeliveryLocation(null)
  }

  const handleModalClose = () => {
    onClose()
  }

  const whatsappButtonHandler = async () => {
    if (!deliveryType || !paymentMethod || !commerceCustomer) return

    const currentCommerceOrganizationId = usePublicCommerceStore.getState().commerce?.organizationId
    const currentCommerceProducts = products?.filter(product => product.organizationId === currentCommerceOrganizationId) || []

    if (currentCommerceProducts.length === 0) {
      onCloseCart()
      return
    }

    const subtotal = currentCommerceProducts.reduce((acc, product) => acc + product.total, 0) || 0
    // Para free delivery (Pechugon), el costo es 0. Para delivery normal, usar el precio calculado
    const deliveryCost =
      deliveryType === 'delivery' && deliveryLocation && !freeDeliveryLocation ? deliveryLocation.price : 0
    const finalTotal = subtotal + deliveryCost

    const order: Order = {
      commercePk: currentCommerceOrganizationId || '',
      customerPhone: commerceCustomer.customerPhone,
      customerName: commerceCustomer.customerName,
      customerEmail: commerceCustomer.customerEmail || '',
      products: currentCommerceProducts,
      orderTimestamp: Date.now(),
      subtotal,
      total: finalTotal,
      currency: 'Gs.',
      orderStatus: 'pending',
      orderType: deliveryType,
      paymentMethod: paymentMethod,
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setIsOrderSaving(true)
    await saveOrder(order)
    setIsOrderSaving(false)

    const message = generateWhatsAppMessage(
      order,
      deliveryType,
      paymentMethod,
      deliveryLocation || undefined,
      freeDeliveryLocation || undefined
    )

    clearProducts()
    onCloseCart()

    // Use the new function with fallback
    openWhatsAppWithFallback(commercePhone || '', message)
  }

  const handleContinueButton = () => {
    if (!deliveryType || !paymentMethod) return

    if (deliveryType === 'pickup' || deliveryType === 'dinein') {
      onOpen()
    } else if (deliveryType === 'delivery') {
      // Primero verificar si es free delivery (Pechugon) - tiene prioridad
      if (isFreeDeliveryEnabled) {
        setCurrentStep('delivery-location')
      } else if (isDeliveryEnabled) {
        // Flujo normal de delivery con cálculo de precio
        setCurrentStep('delivery-location')
      } else {
        // Para comercios fuera de whitelist, ir directo a user info
        onOpen()
      }
    }
  }

  useEffect(() => {
    return () => {
      // cleanup if needed
    }
  })

  return (
    <div className='flex flex-col h-full'>
      {currentStep === 'delivery-location' && isFreeDeliveryEnabled ? (
        // Flujo de delivery gratis (Pechugon)
        <FreeDeliveryLocationStep
          onLocationConfirmed={handleFreeDeliveryLocationConfirmed}
          onBack={handleBackToDeliveryType}
        />
      ) : currentStep === 'delivery-location' && isDeliveryEnabled ? (
        // Flujo de delivery con cálculo de precio
        <DeliveryLocationStep onLocationConfirmed={handleLocationConfirmed} onBack={handleBackToDeliveryType} />
      ) : (
        <>
          <div className='flex-1 overflow-y-auto bg-[#F9F7F4] px-5 pt-7'>
            <div className='mb-20'>
              <h3 className='text-lg font-semibold mb-5'>Método de Pago</h3>
              <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                {paymentMethods.cash && (
                  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div
                      className={`flex items-center pl-5 shadow-md border-l-5 border-transparent rounded-lg bg-white mb-7 py-8 cursor-pointer ${
                        paymentMethod === 'cash' ? `border-l-5` : ''
                      }`}
                      onClick={() => handlePaymentMethodChange('cash')}
                      style={{
                        borderLeftColor: paymentMethod === 'cash' ? businessColor || '#2563eb' : ''
                      }}
                    >
                      <Radio
                        value='cash'
                        className='max-w-full'
                        color='secondary'
                        classNames={{ wrapper: 'cursor-pointer' }}
                      >
                        <div className='flex flex-col gap-1'>
                          <span className='text-base pl-4'>Efectivo</span>
                        </div>
                      </Radio>
                    </div>
                  </motion.div>
                )}

                {paymentMethods.qr && (
                  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div
                      className={`flex items-center pl-5 mt-[-14px] shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-8 cursor-pointer ${
                        paymentMethod === 'qr' ? `border-l-5` : ''
                      }`}
                      onClick={() => handlePaymentMethodChange('qr')}
                      style={{
                        borderLeftColor: paymentMethod === 'qr' ? businessColor || '#2563eb' : ''
                      }}
                    >
                      <Radio
                        value='qr'
                        className='max-w-full'
                        color='secondary'
                        classNames={{ wrapper: 'cursor-pointer' }}
                      >
                        <div className='flex flex-col gap-1'>
                          <span className='text-base pl-4'>Pago QR</span>
                        </div>
                      </Radio>
                    </div>
                  </motion.div>
                )}

                {paymentMethods.transfer && (
                  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div
                      className={`flex items-center pl-5 mt-[-14px] shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-8 cursor-pointer ${
                        paymentMethod === 'transfer' ? `border-l-5` : ''
                      }`}
                      onClick={() => handlePaymentMethodChange('transfer')}
                      style={{
                        borderLeftColor: paymentMethod === 'transfer' ? businessColor || '#2563eb' : ''
                      }}
                    >
                      <Radio
                        value='transfer'
                        className='max-w-full'
                        color='secondary'
                        classNames={{ wrapper: 'cursor-pointer' }}
                      >
                        <div className='flex flex-col gap-1'>
                          <span className='text-base pl-4'>Transferencia Bancaria</span>
                        </div>
                      </Radio>
                    </div>
                  </motion.div>
                )}

                {paymentMethods.paymentLink && (
                  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div
                      className={`flex items-center pl-5 mt-[-14px] shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-8 cursor-pointer ${
                        paymentMethod === 'paymentLink' ? `border-l-5` : ''
                      }`}
                      onClick={() => handlePaymentMethodChange('paymentLink')}
                      style={{
                        borderLeftColor: paymentMethod === 'paymentLink' ? businessColor || '#2563eb' : ''
                      }}
                    >
                      <Radio
                        value='paymentLink'
                        className='max-w-full'
                        color='secondary'
                        classNames={{ wrapper: 'cursor-pointer' }}
                      >
                        <div className='flex flex-col gap-1'>
                          <span className='text-base pl-4'>Link de Pago</span>
                        </div>
                      </Radio>
                    </div>
                  </motion.div>
                )}
              </RadioGroup>

              {paymentMethod && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mt-8'
                >
                  <h3 className='text-lg font-semibold mb-5'>Tipo de Envío</h3>
                  <RadioGroup value={deliveryType} onValueChange={handleDeliveryChange}>
                    {shippingMethods.pickup && (
                      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div
                          className={`flex items-center pl-5 shadow-md border-l-5 border-transparent rounded-lg bg-white mb-1 py-8 cursor-pointer ${
                            deliveryType === 'pickup' ? `border-l-5` : ''
                          }`}
                          onClick={() => handleDeliveryChange('pickup')}
                          style={{
                            borderLeftColor: deliveryType === 'pickup' ? businessColor || '#2563eb' : ''
                          }}
                        >
                          <Radio
                            value='pickup'
                            className='max-w-full'
                            color='secondary'
                            classNames={{ wrapper: 'cursor-pointer' }}
                          >
                            <div className='flex flex-col gap-1'>
                              <span className='text-base pl-4'>Retiro en tienda</span>
                            </div>
                          </Radio>
                        </div>
                      </motion.div>
                    )}

                    {shippingMethods.delivery && (
                      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div
                          className={`flex items-center pl-5 mt-[-14px] shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-8 cursor-pointer ${
                            deliveryType === 'delivery' ? `border-l-5` : ''
                          }`}
                          onClick={() => handleDeliveryChange('delivery')}
                          style={{
                            borderLeftColor: deliveryType === 'delivery' ? businessColor || '#2563eb' : ''
                          }}
                        >
                          <Radio
                            value='delivery'
                            className='max-w-full'
                            color='secondary'
                            classNames={{ wrapper: 'cursor-pointer' }}
                          >
                            <div className='flex flex-col gap-1'>
                              <div className='flex items-center gap-2'>
                                <span className='text-base pl-4'>Delivery</span>
                                {/* Badge de envío gratis para Pechugon */}
                                {isFreeDeliveryEnabled && (
                                  <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
                                    ¡Gratis!
                                  </span>
                                )}
                              </div>
                              {/* Show free delivery info for Pechugon */}
                              {freeDeliveryLocation && deliveryType === 'delivery' && isFreeDeliveryEnabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className='pl-4'
                                >
                                  <p className='text-sm text-green-600 font-medium'>
                                    Envío gratis a tu ubicación
                                    {!freeDeliveryLocation.isInCoverageZone && (
                                      <span className='text-amber-600 text-xs block'>
                                        (Se asignará sucursal cercana)
                                      </span>
                                    )}
                                  </p>
                                </motion.div>
                              )}
                              {/* Show advanced delivery info only for whitelisted commerces */}
                              {deliveryLocation &&
                                deliveryType === 'delivery' &&
                                isDeliveryEnabled &&
                                !isFreeDeliveryEnabled && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className='pl-4'
                                  >
                                    <p className='text-sm text-gray-500'>
                                      Enviar desde:{' '}
                                      <span className='font-medium text-gray-700'>{deliveryLocation.branch}</span>
                                    </p>
                                  </motion.div>
                                )}
                              {/* Show simple message for non-whitelisted commerces */}
                              {deliveryType === 'delivery' && !isDeliveryEnabled && !isFreeDeliveryEnabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className='pl-4'
                                >
                                  <p className='text-sm text-gray-500'>Envío a domicilio</p>
                                </motion.div>
                              )}
                            </div>
                          </Radio>
                        </div>
                      </motion.div>
                    )}

                    {shippingMethods.dinein && (
                      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div
                          className={`flex items-center pl-5 shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-8 cursor-pointer ${
                            deliveryType === 'dinein' ? `border-l-5` : ''
                          }`}
                          onClick={() => handleDeliveryChange('dinein')}
                          style={{
                            borderLeftColor: deliveryType === 'dinein' ? businessColor || '#2563eb' : ''
                          }}
                        >
                          <Radio
                            value='dinein'
                            className='max-w-full'
                            color='secondary'
                            classNames={{ wrapper: 'cursor-pointer' }}
                          >
                            <div className='flex flex-col gap-1'>
                              <span className='text-base pl-4'>Consumir en local</span>
                            </div>
                          </Radio>
                        </div>
                      </motion.div>
                    )}
                  </RadioGroup>
                </motion.div>
              )}
            </div>
          </div>

          <div className='sticky bottom-0 px-5 py-4 bg-[#F9F7F4] border-t border-gray-200'>
            {userInfoCompleted ? (
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    '0 10px 15px -3px rgba(7, 94, 84, 0.3)',
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Button
                  isLoading={isOrderSaving}
                  className='w-full font-medium'
                  size='lg'
                  onPress={whatsappButtonHandler}
                  style={{
                    backgroundColor: '#075e54',
                    color: '#fff'
                  }}
                >
                  <div className='flex items-center justify-center gap-2'>
                    <MessageCircle size={20} />
                    <span>Finalizar en WhatsApp</span>
                  </div>
                </Button>
              </motion.div>
            ) : (
              <Button
                className='w-full font-medium'
                size='lg'
                onPress={handleContinueButton}
                isDisabled={!deliveryType || !paymentMethod}
                style={{
                  backgroundColor: businessColor || '#2563eb',
                  color: '#fff',
                  opacity: !deliveryType || !paymentMethod ? 0.5 : 1
                }}
              >
                <span>siguiente</span>
              </Button>
            )}
          </div>
        </>
      )}

      <ModalUserInfo
        isOpen={isOpen}
        onClose={handleModalClose}
        userInfoCompleted={userInfoCompleted}
        setUserInfoCompleted={setUserInfoCompleted}
      />
    </div>
  )
}
