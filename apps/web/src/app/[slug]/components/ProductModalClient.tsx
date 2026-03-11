'use client'

import { Product } from '@/types/PublicCommerceDataResponse'
import ProductModal from './ProductModal'
import { useDisclosure } from "@heroui/react"
import { useEffect } from 'react'

interface ProductModalClientProps {
  product: Product
  commerceSlug: string
}

export default function ProductModalClient({ product, commerceSlug }: ProductModalClientProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    onOpen()
  }, [])

  const handleModalClose = () => {
    onClose()
    window.location.assign(`/${commerceSlug}`)
  }

  return <ProductModal product={product} onOpen={onOpen} onClose={handleModalClose} isOpen={isOpen} />
}
