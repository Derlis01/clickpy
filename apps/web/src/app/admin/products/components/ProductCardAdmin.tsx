'use client'

import { useState } from 'react'
import { AdminProduct } from '@/types/AdminProduct'
import { Spinner, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Trash, Copy, Eye, EyeOff, Settings } from 'react-feather'
import useProductStore from '@/store/productStore'
import AddProductModal from './modals/AddProductModal'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import ImageEmptyState from '../../../../../public/image-empty-state'

interface ProductCardAdminProps {
  product: AdminProduct
}

const ProductCardAdmin: React.FC<ProductCardAdminProps> = ({ product }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const deleteProductHandler = useProductStore(state => state.deleteProduct)
  const duplicateProduct = useProductStore(state => state.duplicateProduct)
  const setActualProduct = useProductStore(state => state.setActualProduct)
  const updateProductsHiddenStatus = useProductStore(state => state.updateProductsHiddenStatus)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)

  const setProductInStoreHandler = () => {
    setActualProduct(product)
    const params = new URLSearchParams(searchParams.toString())
    params.set('editProduct', product.id)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleDeleteClick = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
    setIsDeleting(true)
    await deleteProductHandler(id)
    setIsDeleting(false)
    toast.info('Producto eliminado', { duration: 4000 })
  }

  const handleDuplicateClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsCopying(true)
    await duplicateProduct(product)
    setIsCopying(false)
    toast.info('Producto duplicado', { duration: 4000 })
  }

  const handleVisibilityClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsUpdatingVisibility(true)

    const success = await updateProductsHiddenStatus([product.id], !product.isHidden)

    if (success) {
      toast.success(product.isHidden ? 'Producto mostrado en el catálogo' : 'Producto ocultado del catálogo', {
        duration: 4000
      })
    } else {
      toast.error('Error al actualizar la visibilidad del producto', { duration: 4000 })
    }

    setIsUpdatingVisibility(false)
  }

  return (
    <>
      <div
        className='group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200'
        onClick={setProductInStoreHandler}
      >
        {/* Image */}
        <div className='relative w-full aspect-square overflow-hidden bg-gray-50'>
          {product.imageUrl ? (
            <img
              className={`w-full h-full object-cover transition-all ${product.isHidden ? 'grayscale opacity-50' : ''}`}
              src={product.imageUrl}
              alt={product.productName}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <ImageEmptyState />
            </div>
          )}

          {/* Status badges */}
          {product.isHidden && (
            <div className='absolute top-2 left-2 bg-gray-700/80 text-white text-xs px-2 py-1 rounded-md'>
              Oculto
            </div>
          )}
        </div>

        {/* Info */}
        <div className='p-3'>
          <h3 className='font-medium text-sm text-gray-900 truncate'>{product.productName}</h3>
          <p className='text-sm text-gray-500 mt-1'>{product.price} Gs.</p>

          {/* Metadata tags */}
          <div className='flex flex-wrap gap-1.5 mt-2'>
            {product.addons && product.addons.length > 0 && (
              <span className='bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-xs'>
                {product.addons.length} agregados
              </span>
            )}
            {product.options && product.options.length > 0 && (
              <span className='bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-xs'>
                {product.options.length} opciones
              </span>
            )}
          </div>
        </div>

        {/* Actions button */}
        <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <Popover placement='bottom-end'>
            <PopoverTrigger>
              <div
                role='button'
                tabIndex={0}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => e.key === 'Enter' && e.stopPropagation()}
                className='p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors'
              >
                <Settings className='text-gray-600' size={16} />
              </div>
            </PopoverTrigger>
            <PopoverContent className='p-2 min-w-[180px]'>
              <div className='flex flex-col gap-1'>
                <button
                  onClick={handleVisibilityClick}
                  disabled={isUpdatingVisibility}
                  className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left'
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
                  disabled={isCopying}
                  className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left'
                >
                  {isCopying ? <Spinner size='sm' /> : <Copy size={16} />}
                  Duplicar producto
                </button>

                <button
                  onClick={event => handleDeleteClick(event, product.id)}
                  disabled={isDeleting}
                  className='flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left'
                >
                  {isDeleting ? <Spinner size='sm' /> : <Trash size={16} />}
                  Eliminar producto
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <AddProductModal
        isOpen={searchParams.get('editProduct') === product.id}
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
