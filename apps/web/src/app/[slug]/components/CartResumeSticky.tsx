'use client'

import { motion, useAnimation } from 'framer-motion'
import usePublicCommerceStore from '@/store/publicCommerce'
import usePublicCart from '@/store/publicCart'
import { useEffect, useState } from 'react'
import { thousandsSeparator } from '@/utils/price'
import { useDisclosure } from '@heroui/react'
import CartResumeForm from '@/app/[slug]/components/CartResumeForm'
import { ProductCart } from '@/types/PublicCommerceDataResponse'

export default function CartResumeSticky() {
  const products = usePublicCart(state => state.products)
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const isPrimaryColorLight = usePublicCommerceStore(state => state.isPrimaryColorLight)
  const [commerceProducts, setCommerceProducts] = useState([] as ProductCart[])
  const [generalTotal, setGeneralTotal] = useState(0)
  const controls = useAnimation()

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  const cartResumeHandler = () => {
    onOpen()
    window.history.pushState(null, '', `/${commerceData?.commerceSlug}/cart?step=1`)
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

  useEffect(() => {
    const filteredProducts = products?.filter(product => product.pk === commerceData?.pk)

    const total = filteredProducts?.reduce((acc, product) => {
      let productTotal = product.price * product.quantity

      // Si hay una opción seleccionada, usar su precio en lugar del precio base
      if (product.selections?.selectedOption) {
        productTotal = product.selections.selectedOption.price * product.quantity
      }

      // Sumar el precio de los adicionales seleccionados
      if (product.selections?.selectedAddons) {
        const addonsTotal = product.selections.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
        productTotal += addonsTotal * product.quantity
      }

      return acc + productTotal
    }, 0)

    setGeneralTotal(total || 0)
    controls.start({
      y: [0, -7, 5, -4, 2, -1, 0],
      transition: { duration: 0.8 }
    })
  }, [products, commerceData])

  const textColor = isPrimaryColorLight ? '#000' : '#fff'

  return (
    <>
      {products && (
        <motion.div
          className='flex justify-center cursor-pointer sticky bottom-4 z-10 mx-auto py-3 w-3/4 md:w-[300px] rounded-full mb-5'
          style={{ backgroundColor: `${commerceData?.commercePrimaryColor}` }}
          animate={controls}
          onClick={cartResumeHandler}
        >
          <span className='font-bold flex items-center gap-2' style={{ color: `${textColor}` }}>
            <span>Ver mi pedido</span>
            <span className='bg-black/30 px-3 py-1 rounded-full text-sm'>Gs. {thousandsSeparator(generalTotal)}</span>
          </span>
        </motion.div>
      )}
      <CartResumeForm isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleModalClose} />
    </>
  )
}
