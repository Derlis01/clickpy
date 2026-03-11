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
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronUp } from 'react-feather'
import useProductStore from '@/store/productStore'
import AddonExplanation from './AddonExplanation'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useRouter } from 'next/navigation'

interface ProductAddon {
  addonId: string
  name: string
  price: number
  isExpanded?: boolean
}

interface AddAddonModalProps {
  onSave: (addons: ProductAddon[]) => void
  isEdit?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const AddonCard: React.FC<{
  addon: ProductAddon
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<ProductAddon>) => void
  onToggleExpand: (id: string) => void
}> = ({ addon, onRemove, onUpdate, onToggleExpand }) => (
  <div className='border border-gray-200 rounded-lg mb-3 shadow-sm'>
    <motion.div className='flex items-center gap-3 p-3 cursor-pointer' onClick={() => onToggleExpand(addon.addonId)}>
      <motion.div
        className='p-1 rounded-full hover:bg-gray-100'
        animate={{ rotate: addon.isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className='w-4 h-4' />
      </motion.div>
      <div className='flex-grow flex flex-col'>
        <span className='font-medium'>{addon.name}</span>
        <span className='text-gray-500 text-sm'>Gs. {addon.price.toLocaleString()}</span>
      </div>
      <Button isIconOnly className='bg-transparent min-w-8 w-8 h-8' onPress={() => onRemove(addon.addonId)}>
        <X className='w-4 h-4' />
      </Button>
    </motion.div>
    <AnimatePresence>
      {addon.isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='overflow-hidden'
        >
          <div className='p-3 pt-0 space-y-2'>
            <Input
              value={addon.name}
              label='Nombre'
              size='sm'
              variant='bordered'
              onChange={e => onUpdate(addon.addonId, { name: e.target.value })}
            />
            <Input
              value={addon.price.toString()}
              label='Precio'
              type='number'
              size='sm'
              variant='bordered'
              onChange={e => onUpdate(addon.addonId, { price: Number(e.target.value) })}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

const AddAddonModal: React.FC<AddAddonModalProps> = ({
  onSave,
  isEdit = false,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const defaultDisclosure = useDisclosure()
  const isOpen = externalIsOpen ?? defaultDisclosure.isOpen
  const onOpenChange = externalOnOpenChange ?? defaultDisclosure.onOpenChange
  const product = useProductStore(state => state.product)
  const router = useRouter()
  const isDesktop = useWindowSize()

  // Nuevo título: si no hay producto, se usa "Configurar adicionales"
  const modalTitle = isEdit
    ? 'Editar adicionales'
    : product?.productName
      ? `Adicionales para ${product.productName}`
      : 'Configurar adicionales'

  const [addonData, setAddonData] = useState({ name: '', price: '' })
  const [savedAddons, setSavedAddons] = useState<ProductAddon[]>([])
  const [showNewAddonForm, setShowNewAddonForm] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    if (isOpen && isEdit && product?.addons) {
      setSavedAddons(product.addons)
    }
  }, [isOpen, isEdit, product])

  // Manejo del cierre y resetear estado
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isEdit && product?.addons) {
        setSavedAddons(product.addons)
      } else {
        setSavedAddons([])
      }
      setAddonData({ name: '', price: '' })
      setShowNewAddonForm(true)
    }
    onOpenChange?.(open)
  }

  const handleAccept = () => {
    if (addonData.name && addonData.price) {
      const newAddon: ProductAddon = {
        addonId: Date.now().toString(),
        name: addonData.name,
        price: Number(addonData.price)
      }
      setSavedAddons(prev => [...prev, newAddon])
      setAddonData({ name: '', price: '' })
      setShowNewAddonForm(false)
    }
  }

  const handleRemoveAddon = (id: string) => {
    setSavedAddons(savedAddons.filter(addon => addon.addonId !== id))
  }

  const handleUpdateAddon = (id: string, updates: Partial<ProductAddon>) => {
    setSavedAddons(savedAddons.map(addon => (addon.addonId === id ? { ...addon, ...updates } : addon)))
  }

  const handleToggleExpand = (id: string) => {
    setSavedAddons(
      savedAddons.map(addon =>
        addon.addonId === id ? { ...addon, isExpanded: !addon.isExpanded } : { ...addon, isExpanded: false }
      )
    )
  }

  const handleSave = () => {
    onSave(savedAddons)
    setAddonData({ name: '', price: '' })
    if (!isEdit) {
      setSavedAddons([])
    }
    setShowNewAddonForm(true)
    onOpenChange(false)
  }

  // Manejo de la navegación "atrás" para cerrar sólo el modal/drawer
  useEffect(() => {
    if (!isOpen) return
    window.history.pushState(null, '', window.location.href)
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      handleOpenChange(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isOpen])

  const renderContent = () => (
    <>
      <ModalHeader className='flex justify-between items-center'>
        <span className='text-xl'>{modalTitle}</span>
      </ModalHeader>
      <ModalBody className='px-4 py-6 md:px-6 space-y-4'>
        {/* Nuevo addon */}
        {showNewAddonForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
          >
            <h3 className='text-sm font-medium text-gray-800 mb-6'>
              {savedAddons.length > 0 ? 'Nuevo adicional' : 'Configura el primer adicional'}
            </h3>
            <div className='space-y-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium text-gray-600'>Nombre</label>
                <Input
                  placeholder='Ej: Extra queso'
                  value={addonData.name}
                  onChange={e => setAddonData(prev => ({ ...prev, name: e.target.value }))}
                  variant='bordered'
                  size='lg'
                  classNames={{ input: 'bg-white' }}
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium text-gray-600'>Precio</label>
                <Input
                  type='number'
                  placeholder='5000'
                  value={addonData.price}
                  onChange={e => setAddonData(prev => ({ ...prev, price: e.target.value }))}
                  variant='bordered'
                  size='lg'
                  startContent={
                    <div className='pointer-events-none flex items-center'>
                      <span className='text-gray-400'>Gs.</span>
                    </div>
                  }
                  classNames={{ input: 'bg-white' }}
                />
              </div>
              <div>
                <Button
                  color='secondary'
                  onPress={handleAccept}
                  isDisabled={!addonData.name || !addonData.price}
                  className='w-full mt-3'
                >
                  Agregar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        {/* Lista de addons */}
        {savedAddons.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-sm font-medium text-gray-700'>Adicionales configurados</h3>
              {!showNewAddonForm && (
                <Button
                  className='bg-gray-200 text-gray-800'
                  variant='flat'
                  size='sm'
                  onPress={() => setShowNewAddonForm(true)}
                >
                  Agregar nuevo
                </Button>
              )}
            </div>
            <div className='divide-y divide-gray-100'>
              {savedAddons.map(addon => (
                <AddonCard
                  key={addon.addonId}
                  addon={addon}
                  onRemove={handleRemoveAddon}
                  onUpdate={handleUpdateAddon}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          </div>
        )}
        {/* Explicación */}
        {savedAddons.length === 0 ? (
          <div className='mx-auto max-w-lg'>
            <AddonExplanation />
          </div>
        ) : (
          <div className='flex flex-col items-center'>
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
                  className='overflow-hidden w-full max-w-lg'
                >
                  <AddonExplanation />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </ModalBody>
      <ModalFooter className='border-t bg-white'>
        <Button color='secondary' className='w-full max-w-md mx-auto' size='lg' onPress={handleSave}>
          {isEdit ? 'Guardar cambios' : 'Guardar'}
        </Button>
      </ModalFooter>
    </>
  )

  return (
    <>
      {isDesktop ? (
        <Drawer
          isOpen={isOpen}
          onClose={() => handleOpenChange(false)}
          placement='right'
          size='lg'
          classNames={{
            base: 'bg-white',
            header: 'border-b-[1px] border-gray-200',
            body: 'p-0 overflow-y-auto scrollbar-hide',
            closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full right-6'
          }}
        >
          <DrawerContent>{renderContent()}</DrawerContent>
        </Drawer>
      ) : (
        <Modal
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          size='full'
          classNames={{
            base: 'bg-white',
            header: 'border-b-[1px] border-gray-200',
            body: 'p-0 overflow-y-auto scrollbar-hide',
            closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full right-6'
          }}
          onClose={() => handleOpenChange(false)}
        >
          <ModalContent>{renderContent()}</ModalContent>
        </Modal>
      )}
    </>
  )
}

export default AddAddonModal
