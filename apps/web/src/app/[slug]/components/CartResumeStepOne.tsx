'use client'

import { Commerce, ProductCart } from '@/types/PublicCommerceDataResponse'
import { thousandsSeparator } from '@/utils/price'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react'
import ProductCartCard from './ProductCartCard'
import usePublicCommerceStore from '@/store/publicCommerce'
import { useState, useEffect } from 'react'
import { saveOrder } from '@/services/checkoutService'
import usePublicCart from '@/store/publicCart'
import { useRouter } from 'next/navigation'
import { Order } from '@/types/Checkout'
import { MessageCircle, Trash2 } from 'react-feather'
import CartEmptyState from '../../../../public/cart-empty-state-svg'

interface CartResumeStepOneProps {
  cartProducts: ProductCart[] | null
  commerceData: Commerce
  onClose: () => void
  textColor: string
  editProducts?: boolean
  handleEditProducts?: () => void
  setEditProducts?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CartResumeStepOne({
  cartProducts,
  commerceData,
  textColor,
  onClose: onCloseCart
}: CartResumeStepOneProps) {
  const commercePhone = usePublicCommerceStore(state => state.commerce?.commercePhone)
  const commerceCustomer = usePublicCart(state => state.commerceCustomer)
  const clearProducts = usePublicCart(state => state.clearProducts)
  const isCommerceOpen = usePublicCommerceStore(state => state.isCommerceOpen)
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()

  const [total, setTotal] = useState(0)

  const router = useRouter()

  const calculateTotal = (products: ProductCart[]) => {
    return products.reduce((acc, product) => {
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
  }

  const nextStepHandler = () => {
    if (!isCommerceOpen) return
    window.history.pushState(null, '', `/${commerceData?.commerceSlug}/cart?step=2`)
  }

  const handleClearCart = () => {
    clearProducts()
    onConfirmClose()
  }

  useEffect(() => {
    if (cartProducts) {
      setTotal(calculateTotal(cartProducts))
    }
  }, [cartProducts])

  return (
    <>
      <ModalBody className='bg-[#F9F7F4] overflow-scroll'>
        <div className='pt-8'>
          <div className='flex justify-between items-center mb-6'>
            <span className='font-semibold text-xl'>Tu pedido</span>
            {cartProducts && cartProducts.length > 0 && (
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={onConfirmOpen}
                className='text-red-500 hover:bg-red-50'
                aria-label='Limpiar carrito'
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>
          <div className='flex flex-col mt-6 gap-3'>
            {cartProducts && cartProducts.length >= 1 ? (
              cartProducts.map((product, index) => <ProductCartCard key={product.sk + index} product={product} />)
            ) : (
              <div className='flex flex-col items-center pt-5 gap-4'>
                <CartEmptyState />
                <p className='text-gray-400'>Aun no tiene productos</p>
              </div>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter className='flex flex-col'>
        <div className='flex justify-between items-center my-2 w-full'>
          <span className='font-semibold text-xl'>Total:</span>
          <span className='font-bold text-xl'>Gs. {thousandsSeparator(total)}</span>
        </div>
        <Button
          className='w-full'
          disabled={cartProducts?.length === 0 || !isCommerceOpen}
          variant='light'
          size='lg'
          onPress={isCommerceOpen ? nextStepHandler : undefined}
          style={{
            backgroundColor:
              cartProducts?.length === 0 || !isCommerceOpen ? 'grey' : `${commerceData?.commercePrimaryColor}`
          }}
        >
          <span className={`text-${textColor}`}>{isCommerceOpen ? 'siguiente' : 'Comercio cerrado'}</span>
        </Button>
      </ModalFooter>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size='sm'>
        <ModalContent>
          <ModalHeader>Confirmar acción</ModalHeader>
          <ModalBody>
            <p>¿Estás seguro de que quieres vaciar todo el carrito?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onConfirmClose}>
              Cancelar
            </Button>
            <Button color='danger' onPress={handleClearCart}>
              Vaciar carrito
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
