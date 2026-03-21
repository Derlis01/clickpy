'use client'

import { motion, AnimatePresence } from 'framer-motion'
import usePublicCommerceStore from '@/store/publicCommerce'
import usePublicCart from '@/store/publicCart'
import useTableSessionStore from '@/store/tableSessionStore'
import { useEffect, useState, useRef, useCallback } from 'react'
import { thousandsSeparator } from '@/utils/price'
import { useDisclosure } from '@heroui/react'
import CartResumeForm from '@/app/[slug]/components/CartResumeForm'
import MesaDrawer from '@/app/[slug]/mesa/[tableId]/components/MesaDrawer'
import { ProductCart } from '@/types/PublicCommerceDataResponse'

let flyCounter = 0

export default function CartResumeSticky() {
  const products = usePublicCart(state => state.products)
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const isPrimaryColorLight = usePublicCommerceStore(state => state.isPrimaryColorLight)
  const mesaSessionId = useTableSessionStore(state => state.sessionId)
  const [generalTotal, setGeneralTotal] = useState(0)
  const prevCountRef = useRef(products?.length ?? 0)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [flyingItems, setFlyingItems] = useState<{ id: number; startY: number; targetX: number; targetY: number; imageUrl: string }[]>([])

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const { isOpen: isMesaOpen, onOpen: onMesaOpen, onClose: onMesaClose } = useDisclosure()

  const isMesaMode = !!mesaSessionId

  const cartResumeHandler = () => {
    if (isMesaMode) {
      onMesaOpen()
    } else {
      onOpen()
      window.history.pushState(null, '', `/${commerceData?.commerceSlug}/cart?step=1`)
    }
  }

  const handleModalClose = () => {
    onClose()
    window.history.back()
  }

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onClose()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onClose])

  // Bump the sticky with a CSS animation — no framer-motion, no double-fire
  const bumpSticky = useCallback(() => {
    const el = stickyRef.current
    if (!el) return
    // Rebote fisico con amortiguacion
    const keyframes = [
      { transform: 'translateY(0)' },
      { transform: 'translateY(5px)' },
      { transform: 'translateY(-3px)' },
      { transform: 'translateY(2px)' },
      { transform: 'translateY(-1px)' },
      { transform: 'translateY(0)' },
    ]
    el.animate(keyframes, {
      duration: 650,
      easing: 'ease-out',
    })
  }, [])

  const removeFlyingItem = useCallback((id: number) => {
    setFlyingItems(prev => prev.filter(d => d.id !== id))
  }, [])

  useEffect(() => {
    const filteredProducts = products?.filter(product => product.organizationId === commerceData?.organizationId)
    const currentCount = filteredProducts?.length ?? 0

    const total = filteredProducts?.reduce((acc, product) => {
      let productTotal = product.price * product.quantity

      if (product.selections?.selectedOption) {
        productTotal = product.selections.selectedOption.price * product.quantity
      }

      if (product.selections?.selectedAddons) {
        const addonsTotal = product.selections.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
        productTotal += addonsTotal * product.quantity
      }

      return acc + productTotal
    }, 0)

    setGeneralTotal(total || 0)

    if (currentCount > prevCountRef.current && stickyRef.current && filteredProducts) {
      const rect = stickyRef.current.getBoundingClientRect()
      const targetX = rect.left + rect.width / 2
      const targetY = rect.top + rect.height / 2

      const id = ++flyCounter
      const startY = window.innerHeight * 0.5
      const lastProduct = filteredProducts[filteredProducts.length - 1]
      const imageUrl = lastProduct?.imageUrl ?? ''

      setFlyingItems(prev => [...prev, { id, startY, targetX, targetY, imageUrl }])

      // Schedule bump for when the image arrives (matches flight duration)
      setTimeout(bumpSticky, 550)
    }

    prevCountRef.current = currentCount
  }, [products, commerceData, bumpSticky])

  const textColor = isPrimaryColorLight ? '#000' : '#fff'
  const primaryColor = commerceData?.commercePrimaryColor ?? '#000'

  const shouldShow = isMesaMode || (products && products.length > 0)

  return (
    <>
      {/* Flying product image */}
      <AnimatePresence>
        {flyingItems.map(item => (
          <FlyingProduct
            key={item.id}
            id={item.id}
            startY={item.startY}
            targetX={item.targetX}
            targetY={item.targetY}
            imageUrl={item.imageUrl}
            onDone={removeFlyingItem}
          />
        ))}
      </AnimatePresence>

      {shouldShow && (
        <div
          ref={stickyRef}
          className='flex justify-center cursor-pointer sticky bottom-4 z-10 mx-auto py-3 w-3/4 md:w-[300px] rounded-full mb-5'
          style={{ backgroundColor: primaryColor }}
          onClick={cartResumeHandler}
        >
          <span className='font-bold flex items-center gap-2' style={{ color: textColor }}>
            <span>{isMesaMode ? 'Mi pedido' : 'Ver mi pedido'}</span>
            {generalTotal > 0 && (
              <span className='bg-black/20 px-3 py-1 rounded-full text-sm'>
                Gs. {thousandsSeparator(generalTotal)}
              </span>
            )}
          </span>
        </div>
      )}

      <CartResumeForm isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleModalClose} />
      <MesaDrawer isOpen={isMesaOpen} onClose={onMesaClose} />
    </>
  )
}

interface FlyingProductProps {
  id: number
  startY: number
  targetX: number
  targetY: number
  imageUrl: string
  onDone: (id: number) => void
}

function FlyingProduct({ id, startY, targetX, targetY, imageUrl, onDone }: FlyingProductProps) {
  const size = 56
  const startX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200
  const deltaX = targetX - startX
  const deltaY = targetY - startY
  const curveOffsetX = deltaX * 0.3
  const curveOffsetY = -60

  // Clean up after flight duration — no onAnimationComplete
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 650)
    return () => clearTimeout(timer)
  }, [id, onDone])

  return (
    <motion.div
      className='fixed z-50 pointer-events-none'
      style={{
        left: startX,
        top: startY,
        width: size,
        height: size,
        x: -(size / 2),
        y: -(size / 2),
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        x: [0, curveOffsetX, deltaX - size / 2],
        y: [0, curveOffsetY, deltaY - size / 2],
        scale: [1, 0.9, 0.3],
        opacity: [1, 0.9, 0],
      }}
      transition={{
        duration: 0.6,
        ease: [0.32, 0, 0.24, 1],
        times: [0, 0.4, 1],
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=''
          className='w-full h-full object-cover rounded-xl'
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        />
      ) : (
        <div
          className='w-full h-full rounded-xl bg-gray-100 flex items-center justify-center'
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          <svg className='w-6 h-6 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
