'use client'

import { useState, useEffect } from 'react'
import { AdminProduct } from '@/types/AdminProduct'
import { useDisclosure, Spinner, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Trash, Copy, MoreHorizontal, Eye, EyeOff, Settings } from 'react-feather'
import useProductStore from '@/store/productStore'
import AddProductModal from './modals/AddProductModal'
import { toast } from 'sonner'
import { useProductLimit } from '@/utils/planLimitations'
import { useSearchParams, useRouter } from 'next/navigation'

interface ProductCardAdminProps {
  product: AdminProduct
}

const ProductMetadata = ({ product }: { product: AdminProduct }) => {
  const hasAddons = product.addons && product.addons.length > 0
  const hasOptions = product.options && product.options.length > 0
  const hasDescription = product.description && product.description.trim().length > 0
  const hasMetadata = hasAddons || hasOptions || hasDescription

  if (!hasMetadata) return <div className='hidden md:block flex-1' />

  return (
    <div className='hidden md:flex items-center gap-3 flex-1 justify-center'>
      {hasAddons && (
        <span className='bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium'>
          {product.addons?.length} agregados
        </span>
      )}
      {hasOptions && (
        <span className='bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium'>
          {product.options?.length} opciones
        </span>
      )}
      {hasDescription && (!hasAddons || !hasOptions) && (
        <p className='text-gray-600 text-sm max-w-[300px] truncate'>{product.description}</p>
      )}
    </div>
  )
}

const ProductCardAdmin: React.FC<ProductCardAdminProps> = ({ product }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { onOpen, onOpenChange } = useDisclosure()
  const { isLimitReached } = useProductLimit()

  const deleteProductHandler = useProductStore(state => state.deleteProduct)
  const duplicateProduct = useProductStore(state => state.duplicateProduct)
  const setActualProduct = useProductStore(state => state.setActualProduct)
  const updateProductsHiddenStatus = useProductStore(state => state.updateProductsHiddenStatus)

  const [shouldOpenModal, setShouldOpenModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)

  const setProductInStoreHandler = () => {
    if (!product.isActive) {
      toast.error('Este producto está inactivo. Actualiza tu plan para editarlo.', {
        duration: 4000
      })
      return
    }
    setActualProduct(product)
    const params = new URLSearchParams(searchParams.toString())
    params.set('editProduct', product.sk)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const editProductId = searchParams.get('editProduct')
    if (editProductId === product.sk) {
      onOpen()
    }
  }, [searchParams, product.sk, onOpen])

  const handleDeleteClick = async (event: React.MouseEvent, sk: string, imageUrl: string) => {
    if (!product.isActive) {
      event.stopPropagation()
      toast.error('Este producto está inactivo. Actualiza tu plan para eliminarlo.', {
        duration: 4000
      })
      return
    }
    event.stopPropagation()
    setIsDeleting(true)
    await deleteProductHandler(sk)
    setIsDeleting(false)
    toast.info('Producto eliminado', {
      duration: 4000
    })
  }

  const handleDuplicateClick = async (event: React.MouseEvent) => {
    if (!product.isActive) {
      event.stopPropagation()
      toast.error('Este producto está inactivo. Actualiza tu plan para duplicarlo.', {
        duration: 4000
      })
      return
    }
    event.stopPropagation()
    if (isLimitReached) {
      toast.warning('Has alcanzado el límite de productos de tu plan', {
        duration: 5000
      })
      return
    }
    setIsCopying(true)
    await duplicateProduct(product)
    setIsCopying(false)
    toast.info('Producto duplicado', {
      duration: 4000
    })
  }
  const handleVisibilityClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsUpdatingVisibility(true)

    const success = await updateProductsHiddenStatus([product.sk], !product.isHidden)

    if (success) {
      toast.success(product.isHidden ? 'Producto mostrado en el catálogo' : 'Producto ocultado del catálogo', {
        duration: 4000
      })
    } else {
      toast.error('Error al actualizar la visibilidad del producto', {
        duration: 4000
      })
    }

    setIsUpdatingVisibility(false)
  }

  return (
    <>
      <div
        className={`flex w-full mb-7 ${product.isActive ? 'hover:bg-gray-50' : 'opacity-60'} p-3 md:p-4 rounded-lg transition-colors cursor-pointer group`}
        onClick={setProductInStoreHandler}
      >
        <div className='flex w-full items-center gap-4 justify-between md:justify-start'>
          <div className='flex shrink-0 md:gap-4 relative'>
            {product.imageUrl ? (
              <img
                className={`h-[50px] w-[59px] md:h-[70px] md:w-[90px] rounded-md object-cover transition-all ${
                  product.isHidden ? 'grayscale opacity-50' : ''
                }`}
                src={product.imageUrl}
                alt={product.productName}
              />
            ) : (
              <div className={`p-9 md:p-10 bg-gray-200 rounded-lg ${product.isHidden ? 'grayscale' : ''}`} />
            )}
            {!product.isActive && (
              <div className='absolute bg-red-500 text-white text-xs px-2 py-1 rounded-full'>Inactivo</div>
            )}
            {product.isActive && product.isHidden && (
              <div className='absolute bg-gray-500 text-white text-xs px-2 py-1 rounded-full'>Oculto</div>
            )}
            <div className='flex flex-col justify-center pl-3 md:pl-0 gap-1'>
              <span className='text-black font-medium md:text-lg max-w-[150px] truncate'>{product.productName}</span>
              <span className='text-gray-500 text-sm md:text-base'>{product.price} Gs.</span>
            </div>
          </div>

          <ProductMetadata product={product} />

          <div className='flex items-center gap-4 shrink-0'>
            <Popover placement='bottom-end'>
              <PopoverTrigger>
                <div className='p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer'>
                  <Settings className='text-gray-400 hover:text-gray-700 transition-colors' size={18} />
                </div>
              </PopoverTrigger>
              <PopoverContent className='p-2 min-w-[180px]'>
                <div className='flex flex-col gap-1'>
                  <button
                    onClick={handleVisibilityClick}
                    disabled={isUpdatingVisibility || !product.isActive}
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${
                      product.isActive ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'
                    } rounded-md transition-colors w-full text-left`}
                  >
                    {isUpdatingVisibility ? (
                      <Spinner size='sm' />
                    ) : product.isHidden ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                    {product.isHidden ? 'Mostrar en catálogo' : 'Ocultar del catálogo'}
                  </button>

                  <button
                    onClick={handleDuplicateClick}
                    disabled={isCopying || !product.isActive}
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${
                      product.isActive ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'
                    } rounded-md transition-colors w-full text-left`}
                  >
                    {isCopying ? <Spinner size='sm' /> : <Copy size={16} />}
                    Duplicar producto
                  </button>

                  <button
                    onClick={event => handleDeleteClick(event, product.sk, product.imageUrl)}
                    disabled={isDeleting || !product.isActive}
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${
                      product.isActive ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'
                    } rounded-md transition-colors w-full text-left`}
                  >
                    {isDeleting ? <Spinner size='sm' /> : <Trash size={16} />}
                    Eliminar producto
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={searchParams.get('editProduct') === product.sk}
        onOpenChange={open => {
          if (!open) {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('editProduct')
            router.push(`?${params.toString()}`, { scroll: false })
          }
        }}
        editMode={true}
      />
    </>
  )
}

export default ProductCardAdmin
