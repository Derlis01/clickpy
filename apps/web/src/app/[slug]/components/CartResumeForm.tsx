'use client'

import {
  Modal,
  ModalContent,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button
} from '@heroui/react'
import usePublicCommerceStore from '@/store/publicCommerce'
import usePublicCart from '@/store/publicCart'
import ProductCartCard from './ProductCartCard'
import { useEffect, useState } from 'react'
import { thousandsSeparator } from '@/utils/price'
import { useParams, useSearchParams, usePathname } from 'next/navigation'
import CartResumeStepOne from './CartResumeStepOne'
import CartResumeStepTwo from './CartResumeStepTwo'
import CartResumeStepThree from './CartResumeStepThree'
import { ProductCart } from '@/types/PublicCommerceDataResponse'
import { useWindowSize } from '@/hooks/useWindowSize'

interface CartResumeFormProps {
  isOpen: boolean
  onOpenChange: () => void
  onClose: () => void
}

export default function CartResumeForm({ isOpen, onClose }: CartResumeFormProps) {
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const products = usePublicCart(state => state.products)
  const isPrimaryColorLight = usePublicCommerceStore(state => state.isPrimaryColorLight)
  const [generalTotal, setGeneralTotal] = useState(0)
  const [editProducts, setEditProducts] = useState(false)
  const [actualCommerceProducts, setActualCommerceProducts] = useState([] as ProductCart[])
  const isDesktop = useWindowSize()

  const commercePrimaryColor = commerceData?.commercePrimaryColor

  const textColor = isPrimaryColorLight ? 'black' : 'white'

  const searchParams = useSearchParams()
  const step = searchParams.get('step')

  useEffect(() => {
    const filteredProducts = products?.filter(product => product.pk === commerceData?.pk)

    const total = filteredProducts?.reduce((acc, product) => {
      let productTotal = product.price * product.quantity

      if (product.selections?.selectedOption) {
        productTotal = product.selections.selectedOption.price * product.quantity
      }

      if (product.selections?.selectedAddons) {
        productTotal += product.selections.selectedAddons.reduce(
          (sum, addon) => sum + addon.price * product.quantity,
          0
        )
      }

      return acc + productTotal
    }, 0)

    setActualCommerceProducts(filteredProducts || [])
    setGeneralTotal(total || 0)
  }, [products, commerceData])

  const handleEditProducts = () => {
    setEditProducts(!editProducts)
  }

  const handleClose = () => {
    onClose()
  }

  const renderContent = () => {
    if (!commerceData) return null

    return (
      <>
        <div
          className='flex flex-col gap-1 text-center py-6'
          style={{ backgroundColor: commerceData.commercePrimaryColor, color: textColor }}
        >
          {commerceData.commerceName.toLocaleUpperCase()}
        </div>

        {step === '1' ? (
          <CartResumeStepOne
            onClose={handleClose}
            cartProducts={actualCommerceProducts}
            textColor={textColor}
            commerceData={commerceData}
          />
        ) : step === '2' ? (
          <CartResumeStepTwo onCloseCart={handleClose} />
        ) : (
          <CartResumeStepThree />
        )}
      </>
    )
  }

  // Force re-render when switching between desktop/mobile to avoid conflicts
  const modalKey = `modal-${isDesktop ? 'desktop' : 'mobile'}-${isOpen}`

  return (
    <>
      {commercePrimaryColor && (
        <>
          {isDesktop ? (
            <Drawer
              key={modalKey}
              isOpen={isOpen}
              onClose={handleClose}
              placement='right'
              size='lg'
              classNames={{
                base: 'bg-white',
                closeButton: 'hover:bg-red/5 active:bg-red bg-white p-2 top-5 right-3'
              }}
            >
              <DrawerContent>{renderContent()}</DrawerContent>
            </Drawer>
          ) : (
            <Modal
              key={modalKey}
              isOpen={isOpen}
              onClose={handleClose}
              size='full'
              classNames={{
                body: '',
                backdrop: '',
                base: '',
                header: `text-center py-6`,
                footer: '',
                closeButton: 'hover:bg-red/5 active:bg-red bg-white p-2 top-5 right-3'
              }}
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.3, ease: 'easeOut' }
                  },
                  exit: {
                    y: 20,
                    opacity: 0,
                    transition: { duration: 0.2, ease: 'easeIn' }
                  }
                }
              }}
            >
              <ModalContent>{renderContent()}</ModalContent>
            </Modal>
          )}
        </>
      )}
    </>
  )
}
