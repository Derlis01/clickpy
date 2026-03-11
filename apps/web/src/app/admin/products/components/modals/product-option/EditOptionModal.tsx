'use client'

import React, { useState, useCallback } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  useDisclosure,
  Chip,
  Switch
} from '@heroui/react'
import { ProductOption, OptionValue } from '@/types/AdminProduct'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Trash } from 'react-feather'
import { thousandsSeparator } from '@/utils/price'

interface EditOptionModalProps {
  option: ProductOption
  onSave: (updatedOption: ProductOption) => void
  onDelete: (optionId: string) => void
}

interface OptionValueCardProps {
  isOpen?: boolean
  value: OptionValue
  // Changed from React.MouseEvent to React.SyntheticEvent to allow PressEvent
  onRemove: (e: any, id: string) => void
  onUpdate: (id: string, updates: Partial<OptionValue>) => void
  onToggleExpand: (id: string) => void
}

const OptionValueCard = React.memo<OptionValueCardProps>(
  ({ value, onRemove, onUpdate, onToggleExpand, isOpen = false }) => (
    <div className='border border-gray-200 rounded-lg'>
      <motion.div
        className='flex items-center gap-3 p-3 cursor-pointer'
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onToggleExpand(value.optionValueId)
        }}
      >
        <motion.div
          className='p-1 rounded-full hover:bg-gray-100'
          animate={{ rotate: value.isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className='w-4 h-4' />
        </motion.div>
        <div className='flex-grow flex flex-col'>
          <span className='font-medium'>{value.name}</span>
          <span className='text-gray-500 text-sm'>Gs. {thousandsSeparator(value.price)}</span>
        </div>
        <Button isIconOnly className='bg-transparent min-w-8 w-8 h-8' onPress={e => onRemove(e, value.optionValueId)}>
          <X className='w-4 h-4' />
        </Button>
      </motion.div>

      <AnimatePresence>
        {value.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='p-3 pt-0 space-y-2' onClick={e => e.stopPropagation()}>
              <Input
                value={value.name}
                label='Nombre'
                size='sm'
                variant='bordered'
                onChange={e => {
                  e.stopPropagation()
                  onUpdate(value.optionValueId, { name: e.target.value })
                }}
              />
              <Input
                value={value.price.toString()}
                label='Precio'
                type='number'
                size='sm'
                variant='bordered'
                onChange={e => {
                  e.stopPropagation()
                  onUpdate(value.optionValueId, { price: Number(e.target.value) })
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
)

const NewValueForm = React.memo<{
  onAccept: (name: string, price: string) => void
}>(({ onAccept }) => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = () => {
    if (name && price) {
      onAccept(name, price)
      setName('')
      setPrice('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-3 mt-2'
    >
      <Input
        placeholder='Ej. Mediano, Rojo, Vainilla'
        value={name}
        variant='bordered'
        onChange={e => setName(e.target.value)}
      />
      <Input
        type='number'
        placeholder='Gs. 55.000'
        variant='bordered'
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
      <Button className='w-full' color='default' variant='faded' onPress={handleSubmit}>
        Aceptar
      </Button>
    </motion.div>
  )
})

const EditOptionModal: React.FC<EditOptionModalProps> = React.memo(({ option, onSave, onDelete }) => {
  const { isOpen, onOpen, onClose: baseOnClose } = useDisclosure()
  const [editedOption, setEditedOption] = useState<ProductOption>(option)
  const [showNewValueForm, setShowNewValueForm] = useState(false)

  const onClose = useCallback(() => {
    baseOnClose()
    setEditedOption(option)
  }, [baseOnClose, option])

  const handleValueUpdate = useCallback((valueId: string, updates: Partial<OptionValue>) => {
    setEditedOption(prev => ({
      ...prev,
      values: prev.values.map(value => (value.optionValueId === valueId ? { ...value, ...updates } : value))
    }))
  }, [])

  const handleRemoveValue = useCallback((e: React.MouseEvent, valueId: string) => {
    e.stopPropagation()
    setEditedOption(prev => ({
      ...prev,
      values: prev.values.filter(value => value.optionValueId !== valueId)
    }))
  }, [])

  const handleAddValue = useCallback((name: string, price: string) => {
    const newValue: OptionValue = {
      optionValueId: Date.now().toString(),
      name,
      price: Number(price),
      isExpanded: false
    }

    setEditedOption(prev => ({
      ...prev,
      values: [...prev.values, newValue]
    }))
    setShowNewValueForm(false)
  }, [])

  const handleSave = useCallback(() => {
    onSave(editedOption)
    baseOnClose()
  }, [onSave, editedOption, baseOnClose])

  const handleDelete = useCallback(() => {
    onDelete(option.optionId)
    baseOnClose()
  }, [onDelete, option.optionId, baseOnClose])

  const handleToggleExpand = useCallback((valueId: string) => {
    setEditedOption(prev => ({
      ...prev,
      values: prev.values.map(value =>
        value.optionValueId === valueId ? { ...value, isExpanded: !value.isExpanded } : { ...value, isExpanded: false }
      )
    }))
  }, [])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setEditedOption(prev => ({ ...prev, name: e.target.value }))
  }, [])

  return (
    <>
      <div onClick={onOpen} className='cursor-pointer w-full'>
        <div className='rounded-lg p-4 hover:border-primary-200 border border-gray-100 transition-all duration-200'>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center gap-3'>
              <h4 className='text-base font-normal text-gray-800'>{option.name}</h4>
            </div>
          </div>
          <div className='flex gap-2'>
            {option.values.map(value => (
              <Chip className='bg-gray-200' key={value.optionValueId}>
                <span className='text-gray-700 font-normal'>{value.name}</span>
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='full'
        scrollBehavior='inside'
        classNames={{
          base: 'bg-[#F5F5F5]'
        }}
      >
        <ModalContent>
          <ModalHeader className='flex justify-between items-center'>
            <span>Editar {option.name}</span>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <div className='flex flex-col gap-4 bg-[#fff] rounded-lg py-7 px-6 shadow-sm mt-4 mb-5'>
                <p className='text-sm font-medium pl-1'>Nombre de la opción</p>
                <Input
                  label='Nombre de la opción'
                  value={editedOption.name}
                  onChange={handleNameChange}
                  variant='bordered'
                  size='lg'
                />
              </div>

              <div className='space-y-4 bg-white rounded-lg p-6'>
                <p className='text-sm font-medium'>Valores de la opción</p>

                {editedOption.values.map(value => (
                  <OptionValueCard
                    key={value.optionValueId}
                    value={value}
                    onRemove={handleRemoveValue}
                    onUpdate={handleValueUpdate}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}

                <AnimatePresence mode='wait'>
                  {showNewValueForm ? (
                    <NewValueForm onAccept={handleAddValue} />
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Button
                        className='w-full'
                        color='default'
                        variant='faded'
                        onPress={() => setShowNewValueForm(true)}
                      >
                        Agregar otro
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' className='w-full' onPress={handleSave}>
              Guardar cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})

OptionValueCard.displayName = 'OptionValueCard'
NewValueForm.displayName = 'NewValueForm'
EditOptionModal.displayName = 'EditOptionModal'

export default EditOptionModal
