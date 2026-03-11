'use client'

import { ProductCart } from '@/types/PublicCommerceDataResponse'
import { thousandsSeparator } from '@/utils/price'
import { Button, Card, CardBody } from '@heroui/react'
import { Plus, Minus, X, Edit3, ChevronDown, ChevronUp } from 'react-feather'
import usePublicCart from '@/store/publicCart'
import { useState } from 'react'
import ProductModal from './ProductModal'

interface ProductCartCardProps {
  product: ProductCart
  onQuantityChange?: (newQuantity: number) => void
}

export default function ProductCartCard({ product, onQuantityChange }: ProductCartCardProps) {
  const removeProduct = usePublicCart(state => state.removeProduct)
  const commitSelections = usePublicCart(state => state.commitSelections)
  const setTemporaryOption = usePublicCart(state => state.setTemporaryOption)
  const addTemporaryAddon = usePublicCart(state => state.addTemporaryAddon)
  const clearTemporarySelections = usePublicCart(state => state.clearTemporarySelections)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getUnitPrice = () => {
    let unitPrice = product.price

    if (product.selections?.selectedOption) {
      unitPrice = product.selections.selectedOption.price
    }

    if (product.selections?.selectedAddons && product.selections.selectedAddons.length > 0) {
      unitPrice += product.selections.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    }

    return unitPrice
  }

  const unitPrice = getUnitPrice()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return

    setIsUpdating(true)
    commitSelections(product.unicCartId, newQuantity)
    onQuantityChange?.(newQuantity)
    setIsUpdating(false)
  }

  const handleRemoveProduct = () => {
    removeProduct(product)
  }

  const handleEditProduct = () => {
    // Prepare temporary selections for editing
    clearTemporarySelections()

    if (product.selections?.selectedOption) {
      setTemporaryOption(product.selections.selectedOption)
    }

    if (product.selections?.selectedAddons) {
      product.selections.selectedAddons.forEach(addon => {
        addTemporaryAddon(addon)
      })
    }

    setIsEditModalOpen(true)
  }

  // Truncate long text helper
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Format large numbers with appropriate units
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return thousandsSeparator(price)
  }

  // Calculate if we need to show details button
  const hasDetailedPricing = () => {
    const hasOptionWithDifferentPrice =
      product.selections?.selectedOption && product.selections.selectedOption.price !== product.price
    const hasPaidAddons =
      product.selections?.selectedAddons && product.selections.selectedAddons.some(addon => addon.price > 0)
    const hasAnyAddons = product.selections?.selectedAddons && product.selections.selectedAddons.length > 0

    return hasOptionWithDifferentPrice || hasPaidAddons || hasAnyAddons
  }

  return (
    <>
      <div className='relative'>
        <Card className='w-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group'>
          <CardBody className='p-3' onClick={handleEditProduct}>
            <div className='flex gap-3 items-center min-h-14'>
              {/* Product Image - Always centered */}
              <div className='flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center relative'>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.productName} className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                    <span className='text-gray-300 text-[10px]'>Sin imagen</span>
                  </div>
                )}

                {/* Edit indicator on hover */}
                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 rounded-md'>
                  <Edit3 size={14} className='text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                </div>
              </div>

              {/* Product Details */}
              <div className='flex-1 min-w-0 py-1'>
                {/* Product Name - Responsive truncation */}
                <h4 className='font-medium text-sm leading-tight text-gray-900 mb-1 pr-6'>
                  <span className='block sm:hidden'>{truncateText(product.productName, 25)}</span>
                  <span className='hidden sm:block'>{truncateText(product.productName, 40)}</span>
                </h4>

                {/* Ver detalles button - positioned below product name */}
                {hasDetailedPricing() && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setShowDetails(!showDetails)
                    }}
                    className='flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors mb-2'
                  >
                    <span>{showDetails ? 'Ocultar detalles' : 'Ver detalles'}</span>
                    {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}

                {/* Price Details Expandable Section with Animation */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    showDetails && hasDetailedPricing() ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className='bg-gray-50 rounded-md p-2 mb-2 text-xs space-y-1' onClick={e => e.stopPropagation()}>
                    {/* Selected Option */}
                    {product.selections?.selectedOption && (
                      <div className='flex items-center text-gray-600'>
                        <span className='truncate pr-2'>Opción: {product.selections.selectedOption.name}</span>
                        <div className='flex-1 border-b border-dotted border-gray-300 mx-2 min-w-4'></div>
                        <span className='flex-shrink-0'>
                          Gs. {thousandsSeparator(product.selections.selectedOption.price)}
                        </span>
                      </div>
                    )}

                    {/* All Addons (with and without price) */}
                    {product.selections?.selectedAddons &&
                      product.selections.selectedAddons.map(addon => (
                        <div key={addon.addonId} className='flex items-center text-gray-600'>
                          <span className='truncate pr-2'>{addon.name}</span>
                          <div className='flex-1 border-b border-dotted border-gray-300 mx-2 min-w-4'></div>
                          <span className='flex-shrink-0'>
                            {addon.price > 0 ? `+Gs. ${thousandsSeparator(addon.price)}` : 'Incluido'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Price and Controls Row */}
                <div className='flex justify-between items-center'>
                  {/* Quantity Controls */}
                  <div
                    className='flex items-center bg-gray-50 rounded-full p-0.5 hover:bg-gray-100 transition-colors'
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() => handleQuantityChange(product.quantity - 1)}
                      isDisabled={product.quantity <= 1 || isUpdating}
                      className='h-7 w-7 min-w-7 rounded-full hover:bg-gray-200 transition-colors'
                    >
                      <Minus size={12} />
                    </Button>

                    <span className='text-sm font-medium px-3 min-w-8 text-center select-none'>
                      {product.quantity > 99 ? '99+' : product.quantity}
                    </span>

                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() => handleQuantityChange(product.quantity + 1)}
                      isDisabled={isUpdating || product.quantity >= 99}
                      className='h-7 w-7 min-w-7 rounded-full hover:bg-gray-200 transition-colors'
                    >
                      <Plus size={12} />
                    </Button>
                  </div>

                  {/* Price Information - Show unit price only when quantity > 1 */}
                  <div className='text-right ml-2' onClick={e => e.stopPropagation()}>
                    {product.quantity > 1 && (
                      <div className='text-xs text-gray-400 leading-none'>
                        <span className='block sm:hidden'>Gs. {formatPrice(unitPrice)} c/u</span>
                        <span className='hidden sm:block'>Gs. {thousandsSeparator(unitPrice)} c/u</span>
                      </div>
                    )}
                    <div
                      className={`text-sm font-semibold text-gray-900 leading-none ${product.quantity > 1 ? 'mt-0.5' : ''}`}
                    >
                      <span className='block sm:hidden'>Gs. {formatPrice(product.total)}</span>
                      <span className='hidden sm:block'>Gs. {thousandsSeparator(product.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Remove Button - Positioned outside */}
        <Button
          isIconOnly
          size='sm'
          variant='light'
          onPress={() => handleRemoveProduct()}
          className='absolute -top-2 -right-2 h-6 w-6 min-w-6 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-full shadow-sm z-10 transition-colors'
          aria-label='Eliminar producto'
        >
          <X size={12} />
        </Button>
      </div>

      {/* Product Edit Modal */}
      <ProductModal
        product={product}
        isOpen={isEditModalOpen}
        onOpen={() => setIsEditModalOpen(true)}
        onClose={() => setIsEditModalOpen(false)}
        editMode={true}
        unicCartId={product.unicCartId}
      />
    </>
  )
}
