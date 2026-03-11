'use client'

import { Commerce, Product } from '@/types/PublicCommerceDataResponse'
import ProductModal from './ProductModal'
import { useDisclosure } from '@heroui/react'
import { useEffect } from 'react'
import { Card, CardBody, CardFooter, Image } from '@heroui/react'
import { thousandsSeparator } from '@/utils/price'
import ImageEmptyState from '../../../../public/image-empty-state'

interface ProductCardProps {
  product: Product
  commerce: Commerce
}

const ProductCard: React.FC<ProductCardProps> = ({ product, commerce }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()

  const productCardHandler = () => {
    onOpen()
    window.history.pushState(null, '', `/${commerce.commerceSlug}/${product.sk}`)
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

  return (
    <>
      <Card shadow='sm' isPressable onPress={productCardHandler} className='w-full'>
        <CardBody className='overflow-visible p-0'>
          {product.imageUrl ? (
            <Image
              radius='none'
              width='100%'
              loading='lazy'
              alt={product.productName}
              className='w-full object-cover h-[140px] md:h-[160px] lg:h-[180px]'
              src={product.imageUrl}
            />
          ) : (
            <div className='w-full h-[140px] md:h-[160px] lg:h-[180px] bg-gray-50 flex items-center justify-center'>
              <ImageEmptyState />
            </div>
          )}
        </CardBody>
        <CardFooter className='flex flex-col gap-2 text-small'>
          <div className='w-full'>
            <h5 className='font-semibold text-sm md:text-base text-ellipsis overflow-hidden whitespace-nowrap'>
              {product.productName}
            </h5>
          </div>
          <p className='font-semibold text-gray-700 px-5'>Gs. {thousandsSeparator(product.price)}</p>
        </CardFooter>
      </Card>

      <ProductModal product={product} onOpen={onOpen} onClose={handleModalClose} isOpen={isOpen} />
    </>
  )
}
export default ProductCard
