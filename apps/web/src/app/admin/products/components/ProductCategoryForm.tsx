'use client'

import useProductStore from '@/store/productStore'
import { AdminProduct } from '@/types/AdminProduct'
import { Autocomplete, AutocompleteItem } from '@heroui/react'
import { Key, useState, useEffect, useRef, useMemo } from 'react'

interface Item {
  label: string
  value: string
}

interface ProductImageFormProps {
  productForm: AdminProduct
  setProductForm: (productForm: AdminProduct) => void
  isFormValid: boolean
}

export default function ProductCategoryForm({ productForm, setProductForm, isFormValid }: ProductImageFormProps) {
  const allCategories = useProductStore(state => state.categories)
  const products = useProductStore(state => state.products)
  const defaultItems = allCategories.map(category => ({ label: category, value: category }))
  const [inputValue, setInputValue] = useState(productForm.category !== '' ? productForm.category : '')
  const isUserTypingRef = useRef(false)

  // Mapeo de nombre de categoría → categoryId
  const categoryIdMap = useMemo(() => {
    const map: Record<string, string> = {}
    products.forEach(p => {
      if (p.category && p.categoryId) {
        map[p.category] = p.categoryId
      }
    })
    return map
  }, [products])

  // Sincronizar inputValue con cambios externos en productForm.category
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setInputValue(productForm.category)
    }
  }, [productForm.category])

  const handleSelectionChange = (key: Key | null) => {
    isUserTypingRef.current = false
    if (key !== null) {
      const item = defaultItems.find(item => item.value === key)
      if (item) {
        setInputValue(item.label)
        setProductForm({
          ...productForm,
          category: item.label,
          categoryId: categoryIdMap[item.label] || ''
        })
      }
    }
  }

  const handleInputChange = (value: string) => {
    isUserTypingRef.current = true
    setInputValue(value)
    setProductForm({
      ...productForm,
      category: value,
      categoryId: categoryIdMap[value] || ''
    })

    setTimeout(() => {
      isUserTypingRef.current = false
    }, 100)
  }

  return (
    <>
      <div className='flex flex-col gap-1 w-full mt-7'>
        <span className='text-black'>Categoría*</span>
        <span className='text-xs text-gray-500'>
          Selecciona una categoría existente o crea una nueva escribiendo el nombre. Por ejemplo: Bebidas, Snacks,
          Limpieza, etc.
        </span>
      </div>
      <Autocomplete
        allowsCustomValue
        placeholder='Escribe para buscar o crear una categoría'
        label='Nombre de la categoría'
        variant='bordered'
        className='w-full mb-2'
        defaultItems={allCategories ? allCategories.map(category => ({ label: category, value: category })) : []}
        selectedKey={productForm.category !== '' && allCategories.includes(productForm.category) ? productForm.category : null}
        inputValue={inputValue}
        onSelectionChange={handleSelectionChange}
        onInputChange={handleInputChange}
        menuTrigger='focus'
        isReadOnly={false}
        isInvalid={!isFormValid && productForm.category === ''}
        errorMessage={!isFormValid && productForm.category === '' ? 'Debes seleccionar o crear una categoría' : ''}
        classNames={{
          popoverContent: 'z-[9999]',
          base: 'max-w-full cursor-pointer',
          listbox: 'max-h-[200px]'
        }}
        onClick={e => e.stopPropagation()}
      >
        {(item: Item) => (
          <AutocompleteItem key={item.value} className='cursor-pointer'>
            {item.label}
          </AutocompleteItem>
        )}
      </Autocomplete>
    </>
  )
}
