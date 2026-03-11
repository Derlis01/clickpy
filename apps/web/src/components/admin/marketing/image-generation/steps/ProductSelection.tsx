import { useState, useEffect } from 'react'
import { Card, Image, Button, Checkbox } from '@heroui/react'
import { ChevronLeft } from 'react-feather'
import { AdminProduct } from '@/types/AdminProduct'
import useProductStore from '@/store/productStore'
import { thousandsSeparator } from '@/utils/price'

interface ProductSelectionProps {
  selectedProducts: AdminProduct[]
  onProductsSelect: (products: AdminProduct[]) => void
  onBack: () => void
  onNext: () => void
}

export const ProductSelection = ({ selectedProducts, onProductsSelect, onBack, onNext }: ProductSelectionProps) => {
  const products = useProductStore(state => state.products)
  const fetchProducts = useProductStore(state => state.fetchProducts)
  const isLoading = useProductStore(state => state.isLoading)

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products.length, fetchProducts])

  const handleProductSelect = (product: AdminProduct) => {
    onProductsSelect(
      selectedProducts.some(p => p.sk === product.sk)
        ? selectedProducts.filter(p => p.sk !== product.sk)
        : selectedProducts.length < 3
          ? [...selectedProducts, product]
          : selectedProducts
    )
  }

  const isMaxSelected = selectedProducts.length >= 3

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <p className='text-sm text-gray-500'>Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 py-4'>
      <h2 className='text-lg font-medium text-center'>¿Para cuál producto querés hacer la publicidad?</h2>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto p-2'>
        {products.map(product => {
          const isSelected = selectedProducts.some(p => p.sk === product.sk)
          const isDisabled = isMaxSelected && !isSelected

          return (
            <Card
              key={product.sk}
              isPressable={!isDisabled}
              isHoverable={!isDisabled}
              shadow='none'
              className={`p-3 cursor-pointer transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-default-200'
              }`}
              onPress={() => !isDisabled && handleProductSelect(product)}
            >
              <div className='flex flex-col items-center gap-2'>
                <div className='relative w-full aspect-square'>
                  <Image
                    src={product.imageUrl || '/image-empty-state.svg'}
                    alt={product.productName}
                    className='object-cover rounded-md w-full h-full'
                  />
                </div>
                <div className='flex flex-col items-center gap-1 w-full'>
                  <p className='text-sm font-medium text-center line-clamp-2'>{product.productName}</p>
                  <p className='text-xs text-gray-500'>Gs. {thousandsSeparator(product.price)}</p>
                </div>
                <Checkbox isSelected={isSelected} className='mt-1' isDisabled={isDisabled} isReadOnly />
              </div>
            </Card>
          )
        })}
      </div>

      <div className='flex justify-between mt-4'>
        <Button variant='ghost' className='gap-2' onPress={onBack}>
          <ChevronLeft size={18} />
          Atrás
        </Button>
        <Button color='primary' isDisabled={selectedProducts.length === 0} onPress={onNext}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
