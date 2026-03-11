'use client'

import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  useDisclosure,
  Drawer,
  DrawerContent
} from '@heroui/react'
import { ChevronDown, ChevronUp, X } from 'react-feather'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductOption, OptionValue } from '@/types/AdminProduct'
import OptionExplanation from './OptionExplanation'
import OptionValueCard from './OptionValueCard'
import NewValueForm from './NewValueForm'
import useProductStore from '@/store/productStore'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useRouter } from 'next/navigation'

interface AddOptionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (option: ProductOption) => void
  isEdit?: boolean
}

const AddOptionModal: React.FC<AddOptionModalProps> = ({ isOpen, onOpenChange, onSave, isEdit = false }) => {
  const product = useProductStore(state => state.product)
  const isDesktop = useWindowSize()
  const router = useRouter()

  const [optionName, setOptionName] = useState('')
  const [savedValues, setSavedValues] = useState<OptionValue[]>([])
  const [showNewValueForm, setShowNewValueForm] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const product = useProductStore.getState().product
      const selectedOptionId = product?.selectedOptionId
      const existingOption = product?.options?.find(opt => opt.optionId === selectedOptionId)
      if (existingOption) {
        setOptionName(existingOption.name)
        setSavedValues(existingOption.values)
        setShowNewValueForm(false)
      }
    }
  }, [isEdit, isOpen])

  const handleAcceptValue = (name: string, price: string) => {
    setSavedValues([
      ...savedValues,
      {
        optionValueId: Date.now().toString(),
        name,
        price: Number(price),
        isExpanded: false
      }
    ])
    setShowNewValueForm(false)
  }

  const handleRemoveValue = (id: string) => {
    setSavedValues(savedValues.filter(value => value.optionValueId !== id))
  }

  const handleUpdateValue = (id: string, updates: Partial<OptionValue>) => {
    setSavedValues(savedValues.map(value => (value.optionValueId === id ? { ...value, ...updates } : value)))
  }

  const toggleExpand = (id: string) => {
    setSavedValues(
      savedValues.map(value =>
        value.optionValueId === id ? { ...value, isExpanded: !value.isExpanded } : { ...value, isExpanded: false }
      )
    )
  }

  const handleSave = () => {
    const newOption: ProductOption = {
      optionId: isEdit ? product?.selectedOptionId || Date.now().toString() : Date.now().toString(),
      name: optionName,
      values: savedValues
    }
    onSave(newOption)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setOptionName('')
    setSavedValues([])
    setShowNewValueForm(true)
    setShowExplanation(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const renderContent = () => (
    <>
      <ModalHeader className='flex justify-between items-center'>
        <span>{isEdit ? 'Editar opción' : 'Agregar opción'}</span>
      </ModalHeader>
      <ModalBody className='relative'>
        <div className='flex flex-col gap-3 w-full'>
          <div className='flex flex-col gap-4 bg-white rounded-lg py-7 pb-8 px-6 shadow-sm mx-5 mt-5'>
            <p className='text-sm font-medium pl-1'>Nombre de la opción</p>
            <Input
              placeholder='Talla, Color, Sabor, etc.'
              value={optionName}
              onChange={e => setOptionName(e.target.value)}
              variant='bordered'
              size='lg'
            />
          </div>
          {optionName.length < 3 ? (
            <div className='mx-7'>
              <OptionExplanation />
            </div>
          ) : (
            <div className='flex flex-col gap-4 border border-gray-300 bg-white rounded-lg py-8 px-8 shadow-sm mx-5'>
              <p className='text-sm font-medium'>
                ¿Qué opciones tenés para <strong>{optionName}</strong>?
              </p>
              <AnimatePresence>
                {savedValues.map(value => (
                  <motion.div
                    key={value.optionValueId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <OptionValueCard
                      value={value}
                      onRemove={handleRemoveValue}
                      onUpdate={handleUpdateValue}
                      onToggleExpand={toggleExpand}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence mode='wait'>
                {showNewValueForm ? (
                  <NewValueForm onAccept={handleAcceptValue} />
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
          )}
        </div>
        {optionName.length >= 3 && (
          <div className='flex flex-col items-center mt-5 mb-4'>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors'
            >
              {showExplanation ? (
                <>
                  <ChevronUp className='w-4 h-4' />
                  Ocultar explicación
                </>
              ) : (
                <>
                  <ChevronDown className='w-4 h-4' />
                  Mostrar explicación
                </>
              )}
            </button>
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className='overflow-hidden w-full max-w-2xl px-7'
                >
                  <OptionExplanation />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color='secondary'
          className='w-full'
          onPress={handleSave}
          isDisabled={!optionName || savedValues.length === 0}
        >
          {isEdit ? 'Guardar cambios' : 'Agregar'}
        </Button>
      </ModalFooter>
    </>
  )

  // Manejo de navegación "atrás" para cerrar solo el modal/drawer
  useEffect(() => {
    if (!isOpen) return
    window.history.pushState(null, '', window.location.href)
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      handleClose()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isOpen])

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
            header: 'border-b-[1px] border-gray-200',
            body: 'p-0 overflow-y-auto',
            closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full right-6'
          }}
        >
          <DrawerContent>{renderContent()}</DrawerContent>
        </Drawer>
      ) : (
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size='full'
          classNames={{
            base: 'bg-white',
            header: 'border-b-[1px] border-gray-200',
            body: 'p-0 overflow-y-auto',
            closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full right-6'
          }}
          onClose={handleClose}
        >
          <ModalContent>{renderContent()}</ModalContent>
        </Modal>
      )}
    </>
  )
}

export default AddOptionModal
