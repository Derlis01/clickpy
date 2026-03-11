'use client'

import { AdminProduct } from '@/types/AdminProduct'
import { Input, Textarea } from "@heroui/react"

interface ProductImageFormProps {
  productForm: AdminProduct
  setProductForm: (productForm: AdminProduct) => void
  isFormValid: boolean
}

export default function ProducDataForm({ productForm, setProductForm, isFormValid }: ProductImageFormProps) {
  return (
    <>
      <div className='flex flex-col gap-5 w-full mt-7'>
        <Input
          type='text'
          label='Nombre del producto*'
          value={productForm.productName}
          isInvalid={!isFormValid && productForm.productName === ''}
          errorMessage={!isFormValid && productForm.productName === '' ? 'Debes agregar un nombre al producto' : ''}
          radius='sm'
          size='md'
          onChange={e => setProductForm({ ...productForm, productName: e.target.value })}
          variant='bordered'
        />
        <Input
          type='number'
          label='Precio*'
          radius='sm'
          size='md'
          isInvalid={!isFormValid && productForm.price <= 0}
          errorMessage={!isFormValid && productForm.price <= 0 ? 'Debes agregar un precio al producto' : ''}
          value={productForm.price.toString()}
          onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
          variant='bordered'
          endContent={<span className='mb-1 text-gray-500'>Gs</span>}
        />
        <Textarea
          radius='sm'
          size='md'
          variant='bordered'
          value={productForm.description}
          label='Descripción'
          placeholder='(Opcional)'
          onChange={e => setProductForm({ ...productForm, description: e.target.value })}
        />
      </div>
    </>
  )
}
