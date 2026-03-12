'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from '@heroui/react'
import { useState, useEffect } from 'react'
import useProductStore from '@/store/productStore'
import { AdminProduct } from '@/types/AdminProduct'
import { toast } from 'sonner'

interface EditCategoryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  categoryName: string
  products: AdminProduct[]
}

export default function EditCategoryModal({ isOpen, onOpenChange, categoryName, products }: EditCategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const updateCategoryName = useProductStore(state => state.updateCategoryName)
  const categories = useProductStore(state => state.categories)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewCategoryName(categoryName)
      setError('')
    } else {
      setNewCategoryName('')
      setError('')
    }
  }, [isOpen, categoryName])

  const validateCategoryName = (name: string): string => {
    if (!name.trim()) {
      return 'Ingresa un nombre'
    }

    if (name.trim().length < 1) {
      return 'Muy corto'
    }

    if (name.trim() !== categoryName && categories.includes(name.trim())) {
      return 'Este nombre ya existe'
    }

    return ''
  }

  const handleInputChange = (value: string) => {
    setNewCategoryName(value)
    const validationError = validateCategoryName(value)
    setError(validationError)
  }

  const handleSave = async () => {
    const trimmedName = newCategoryName.trim()
    const validationError = validateCategoryName(trimmedName)

    if (validationError) {
      setError(validationError)
      return
    }

    if (trimmedName === categoryName) {
      onOpenChange(false)
      return
    }

    setIsLoading(true)

    try {
      const productIds = products.map(product => product.id)
      const success = await updateCategoryName(productIds, trimmedName)

      if (success) {
        toast.success('Categoría actualizada')
        onOpenChange(false)
      } else {
        toast.error('Error al actualizar')
      }
    } catch (error) {
      toast.error('Error al actualizar')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = !error && newCategoryName.trim() !== ''

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size='md'
      placement='center'
      classNames={{
        base: 'bg-white',
        header: 'border-b border-gray-200 px-6 py-4',
        body: 'px-6 py-6',
        closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full'
      }}
    >
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>
              <h3 className='text-lg font-semibold text-gray-900'>Editar categoría</h3>
            </ModalHeader>
            <ModalBody>
              <div className='flex flex-col gap-4'>
                <Input
                  label='Nuevo nombre'
                  placeholder='Escribe el nuevo nombre'
                  value={newCategoryName}
                  onValueChange={handleInputChange}
                  variant='bordered'
                  isInvalid={!!error}
                  errorMessage={error}
                  autoFocus
                  classNames={{
                    input: 'text-gray-900',
                    label: 'text-gray-700'
                  }}
                />

                <div className='flex gap-3 pt-4'>
                  <Button variant='bordered' onPress={onClose} className='flex-1' isDisabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button
                    color='primary'
                    onPress={handleSave}
                    className='flex-1'
                    isLoading={isLoading}
                    isDisabled={!isFormValid}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
