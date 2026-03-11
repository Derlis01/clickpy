import React, { useState, useEffect } from 'react'
import { Modal, ModalContent, Drawer, DrawerContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { Product } from '@/types/PublicCommerceDataResponse'
import usePublicCommerceStore from '@/store/publicCommerce'
import usePublicCart from '@/store/publicCart'
import { thousandsSeparator } from '@/utils/price'
import ProductOptionSelectModal from './product-modals/ProductOptionSelectModal'
import ProductAddonSelectModal from './product-modals/ProductAddonSelectModal'
import { useWindowSize } from '@/hooks/useWindowSize'
import ImageEmptyState from '../../../../public/image-empty-state'

interface ProductModalProps {
  product: Product
  onOpen: () => void
  onClose: () => void
  isOpen: boolean
  editMode?: boolean
  unicCartId?: number
}

export default function ProductModal({ product, onClose, isOpen, editMode = false, unicCartId }: ProductModalProps) {
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const products = usePublicCart(state => state.products)

  // Fix: Update quantity state to sync with cart product
  const [quantity, setQuantity] = useState<number>(() => {
    if (editMode && unicCartId) {
      const existingProduct = products?.find(p => p.unicCartId === unicCartId)
      return existingProduct?.quantity || 1
    }
    return 1
  })
  const isPrimaryColorLight = usePublicCommerceStore(state => state.isPrimaryColorLight)
  const setProductToCart = usePublicCart(state => state.setProductToCart)
  const setTemporaryOption = usePublicCart(state => state.setTemporaryOption)
  const addTemporaryAddon = usePublicCart(state => state.addTemporaryAddon)
  const temporarySelections = usePublicCart(state => state.temporarySelections)
  const clearTemporarySelections = usePublicCart(state => state.clearTemporarySelections)
  const commitSelections = usePublicCart(state => state.commitSelections)
  const isDesktop = useWindowSize()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Estados para los modales de opciones y adicionales
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)

  // Solo escuchar popstate para cerrar modales internos - SIN tocar el historial
  useEffect(() => {
    const handlePopState = () => {
      // Si cualquier modal interno está abierto, cerrarlo
      if (isOptionModalOpen) {
        setIsOptionModalOpen(false)
      }
      if (isAddonModalOpen) {
        setIsAddonModalOpen(false)
      }
      if (isImageModalOpen) {
        setIsImageModalOpen(false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOptionModalOpen, isAddonModalOpen, isImageModalOpen])

  // Funciones simples para abrir modales - SIN tocar historial
  const openOptionModal = () => setIsOptionModalOpen(true)
  const openAddonModal = () => setIsAddonModalOpen(true)
  const openImageModal = () => setIsImageModalOpen(true)

  // Funciones simples para cerrar modales - SIN tocar historial
  const closeOptionModal = () => setIsOptionModalOpen(false)
  const closeAddonModal = () => setIsAddonModalOpen(false)
  const closeImageModal = () => setIsImageModalOpen(false)

  // Recuperar las selecciones si estamos en modo edición
  useEffect(() => {
    if (editMode && unicCartId) {
      const existingProduct = products?.find(p => p.unicCartId === unicCartId)
      if (existingProduct) {
        // Actualizamos la cantidad con la del producto existente
        setQuantity(existingProduct.quantity)

        if (existingProduct.selections) {
          setTemporaryOption(existingProduct.selections.selectedOption)
          clearTemporarySelections()
          if (existingProduct.selections.selectedOption) {
            setTemporaryOption(existingProduct.selections.selectedOption)
          }
          existingProduct.selections.selectedAddons.forEach(addon => {
            addTemporaryAddon(addon)
          })
        }
      }
    }
  }, [editMode, unicCartId, products]) // Add products to dependencies

  // Limpiar selecciones temporales al cerrar
  useEffect(() => {
    if (!isOpen) {
      clearTemporarySelections()
    }
  }, [isOpen])

  const calculateCurrentPrice = () => {
    let basePrice = temporarySelections.selectedOption?.price || product.price
    const addonsTotal = temporarySelections.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    return (basePrice + addonsTotal) * quantity
  }

  const handleAddQuantity = () => setQuantity((prev: number) => prev + 1)
  const handleRemoveQuantity = () => {
    if (quantity > 1) setQuantity((prev: number) => prev - 1)
  }

  const handleAddToCart = () => {
    // Verificar si hay opciones y no se ha seleccionado ninguna
    if (product.options && product.options.length > 0 && !temporarySelections.selectedOption) {
      openOptionModal()
      return
    }

    // Validar límites de adicionales si están configurados
    if (product.hasAddonLimits && product.minAddons !== undefined) {
      if (temporarySelections.selectedAddons.length < product.minAddons) {
        openAddonModal()
        return
      }
    }

    const productToAdd = {
      ...product,
      quantity,
      unicCartId: editMode && unicCartId ? unicCartId : Date.now(),
      total: calculateCurrentPrice()
    }

    if (editMode && unicCartId) {
      // Aquí está el cambio clave: actualizamos tanto las selecciones como la cantidad
      commitSelections(unicCartId, quantity) // Necesitamos modificar esta función para que acepte quantity
    } else {
      setProductToCart(productToAdd)
    }

    handleClose()
  }

  const handleClose = () => {
    clearTemporarySelections()
    // Solo reseteamos la cantidad si NO estamos en modo edición
    if (!editMode) {
      setQuantity(1)
    }
    onClose()
  }

  const textColor = isPrimaryColorLight ? '#000' : '#fff'

  const renderContent = () => {
    return (
      <div className='flex flex-col h-full'>
        {/* Close button */}
        <div className='absolute top-3 right-3 z-10'>
          <Button isIconOnly className='bg-white hover:bg-gray-100 p-2 rounded-full shadow-md' onPress={handleClose}>
            <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto bg-[#F9F7F4]'>
          {/* Enhanced Image Section with click functionality */}
          {product.imageUrl ? (
            <div className='relative h-[250px] w-full cursor-pointer group' onClick={openImageModal}>
              <img
                src={product.imageUrl}
                alt={product.productName}
                className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
              />
              {/* Hover overlay with zoom hint */}
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center'>
                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-3 shadow-lg'>
                  <svg className='w-5 h-5 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                    />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className='h-[250px] bg-gray-100 flex items-center justify-center w-full'>
              <ImageEmptyState />
            </div>
          )}

          {/* Enhanced Product Info Section - White background touches edges */}
          <div className='bg-white pt-4 pb-6 mb-5'>
            <div className='px-4'>
              {/* 1. Product Name First - Following big platforms pattern */}
              <h1 className='font-semibold text-xl text-gray-900 mb-2 leading-tight'>{product.productName}</h1>

              {/* 2. Price on same line with option indicator */}
              <div className='flex items-center gap-2 mb-3'>
                <span className='font-bold text-2xl text-gray-900'>
                  Gs. {thousandsSeparator(temporarySelections.selectedOption?.price || product.price)}
                </span>
                {temporarySelections.selectedOption && (
                  <span className='text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md font-medium'>
                    Con opción
                  </span>
                )}
              </div>

              {/* 3. Description Last - Complementary information */}
              {product.description && <p className='text-gray-600 text-sm leading-relaxed'>{product.description}</p>}
            </div>
          </div>

          {/* Spacing between sections */}
          <div className='bg-[#F9F7F4] pb-4'>
            {/* Sección de cantidad - with proper padding */}
            <div className='mx-4 mb-4'>
              <div className='flex items-center justify-between px-5 rounded-lg py-4 w-full bg-white'>
                <span>Unidades</span>
                <div className='bg-gray-300 flex justify-between py-1 rounded-lg font-semibold w-[90px]'>
                  <div className='pl-4 pr-3 cursor-pointer' onClick={handleRemoveQuantity}>
                    -
                  </div>
                  <span>{quantity}</span>
                  <div onClick={handleAddQuantity} className='pr-4 pl-3 cursor-pointer'>
                    +
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de opciones - with proper padding */}
            {product.options && product.options.length > 0 && (
              <div className='mx-4 mb-4'>
                <div className='flex items-center justify-between px-5 rounded-lg py-4 w-full bg-white'>
                  <div className='flex flex-col'>
                    <span className='font-medium'>{product?.options[0].name || 'Opciones'}</span>
                    {temporarySelections.selectedOption ? (
                      <span className='text-sm text-gray-600'>
                        {temporarySelections.selectedOption.name} - Gs.{' '}
                        {thousandsSeparator(temporarySelections.selectedOption.price)}
                      </span>
                    ) : (
                      <span className='text-sm text-gray-400'>Selecciona una opción</span>
                    )}
                  </div>
                  <Button className='bg-gray-100' onPress={openOptionModal}>
                    Elegir
                  </Button>
                </div>
              </div>
            )}

            {/* Sección de adicionales - with proper padding */}
            {product.addons && product.addons.length > 0 && (
              <div className='mx-4 mb-4'>
                <div className='flex items-center justify-between px-5 rounded-lg py-4 w-full bg-white'>
                  <div className='flex flex-col'>
                    <span className='font-medium'>Elegir</span>
                    {temporarySelections.selectedAddons.length > 0 ? (
                      <div className='text-sm text-gray-600'>
                        {temporarySelections.selectedAddons.map((addon, idx) => (
                          <div key={addon.addonId}>
                            {addon.name}
                            {addon.price > 0 && ` - Gs. ${thousandsSeparator(addon.price)}`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className='text-sm text-gray-400'>
                        {product.hasAddonLimits
                          ? `Selecciona entre ${product.minAddons} y ${product.maxAddons}`
                          : 'Agrega adicionales opcionales'}
                      </span>
                    )}
                  </div>
                  <Button className='bg-gray-100' onPress={openAddonModal}>
                    Elegir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='sticky bottom-0 px-4 py-4 bg-white border-t border-gray-200'>
          <Button
            className='w-full'
            radius='sm'
            size='lg'
            style={{ backgroundColor: commerceData?.commercePrimaryColor || 'black' }}
            onPress={handleAddToCart}
          >
            <span
              className='flex font-semibold text-base'
              style={{ color: commerceData?.commercePrimaryColor ? textColor : 'white' }}
            >
              {editMode ? 'Guardar cambios' : 'Agregar al pedido'}{' '}
              <div className='rounded-full h-[24px] w-[24px] mx-2' style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}>
                <span>{quantity}</span>
              </div>{' '}
              {`Gs. ${thousandsSeparator(calculateCurrentPrice())}`}
            </span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {isDesktop ? (
        <Drawer
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
          isOpen={isOpen}
          onClose={handleClose}
          size='full'
          classNames={{
            body: 'py-0 px-0',
            backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
            base: '',
            header: 'border-b-[1px]',
            footer: 'border-t-[1px]',
            closeButton: 'hover:bg-red/5 active:bg-red bg-white p-3 top-3 right-3'
          }}
        >
          <ModalContent>{renderContent()}</ModalContent>
        </Modal>
      )}

      {/* Modal de Opciones */}
      {product.options && product.options[0] && (
        <ProductOptionSelectModal
          isOpen={isOptionModalOpen}
          onClose={closeOptionModal}
          options={product.options[0]}
          productBasePrice={product.price}
        />
      )}

      {/* Modal de Adicionales */}
      {product.addons && (
        <ProductAddonSelectModal
          isOpen={isAddonModalOpen}
          onClose={closeAddonModal}
          addons={product.addons}
          hasAddonLimits={product.hasAddonLimits}
          minAddons={product.minAddons}
          maxAddons={product.maxAddons}
        />
      )}

      {/* Image Zoom Modal - Only closes with backdrop */}
      {product.imageUrl && (
        <Modal isOpen={isImageModalOpen} hideCloseButton={true} onClose={closeImageModal} size='md' backdrop='blur'>
          <ModalContent>
            <div className='flex items-center justify-center h-full w-full'>
              <img
                src={product.imageUrl}
                alt={product.productName}
                className='max-h-full max-w-full object-contain rounded-lg'
              />
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
