'use client'

import React, { useEffect, useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from '@heroui/react'
import { ProductAddon } from '@/types/AdminProduct'
import usePublicCart from '@/store/publicCart'
import { thousandsSeparator } from '@/utils/price'
import usePublicCommerceStore from '@/store/publicCommerce'
import { useWindowSize } from '@/hooks/useWindowSize'

interface ProductAddonSelectModalProps {
  isOpen: boolean
  onClose: () => void
  addons: ProductAddon[]
  hasAddonLimits: boolean
  minAddons?: number
  maxAddons?: number
}

export default function ProductAddonSelectModal({
  isOpen,
  onClose,
  addons,
  hasAddonLimits,
  minAddons = 0,
  maxAddons = Infinity
}: ProductAddonSelectModalProps) {
  const initializeWorkingSelections = usePublicCart(state => state.initializeWorkingSelections)
  const commitWorkingSelections = usePublicCart(state => state.commitWorkingSelections)
  const workingSelections = usePublicCart(state => state.workingSelections)
  const temporarySelections = usePublicCart(state => state.temporarySelections)
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const isDesktop = useWindowSize()

  const [selectedCount, setSelectedCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      initializeWorkingSelections(temporarySelections)
      setSelectedCount(temporarySelections.selectedAddons.length)
    }
  }, [isOpen])

  const handleSelectionChange = (checked: boolean, addon: ProductAddon) => {
    if (checked) {
      if (hasAddonLimits && selectedCount >= maxAddons) {
        setErrorMessage(`Puedes seleccionar máximo ${maxAddons} adicionales`)
        return
      }
      const newWorkingSelections = {
        ...workingSelections,
        selectedAddons: [
          ...workingSelections.selectedAddons,
          {
            addonId: addon.addonId,
            name: addon.name,
            price: addon.price
          }
        ]
      }
      initializeWorkingSelections(newWorkingSelections)
      setSelectedCount(prev => prev + 1)
    } else {
      const newWorkingSelections = {
        ...workingSelections,
        selectedAddons: workingSelections.selectedAddons.filter(item => item.addonId !== addon.addonId)
      }
      initializeWorkingSelections(newWorkingSelections)
      setSelectedCount(prev => prev - 1)
    }
    setErrorMessage('')
  }

  const isSelected = (addonId: string) => workingSelections.selectedAddons.some(addon => addon.addonId === addonId)

  const isAddonDisabled = (addon: ProductAddon) => {
    if (isSelected(addon.addonId)) return false // Always allow deselecting
    return hasAddonLimits && selectedCount >= maxAddons
  }

  const handleConfirm = () => {
    if (hasAddonLimits && selectedCount < minAddons) {
      setErrorMessage(`Debes seleccionar al menos ${minAddons} adicionales`)
      return
    }
    commitWorkingSelections()
    onClose()
  }

  const handleClose = () => {
    initializeWorkingSelections(temporarySelections)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={isDesktop ? 'lg' : 'full'}
      classNames={{
        body: 'py-6',
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: isDesktop ? 'my-16' : '',
        closeButton: 'hover:bg-white/5 active:bg-white/10'
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 py-5'>
          <h3 className='text-lg font-semibold'>Elegir</h3>
          {hasAddonLimits && (
            <p className='text-sm text-gray-500'>
              {minAddons === maxAddons
                ? `Selecciona exactamente ${minAddons} adicionales`
                : `Selecciona entre ${minAddons} y ${maxAddons}`}
            </p>
          )}
        </ModalHeader>
        <ModalBody className='bg-[#F9F7F4] overflow-scroll'>
          {errorMessage && <div className='text-sm text-danger mb-4'>{errorMessage}</div>}
          <div className='flex flex-col gap-4'>
            {addons.map(addon => (
              <div
                key={addon.addonId}
                onClick={() => !isAddonDisabled(addon) && handleSelectionChange(!isSelected(addon.addonId), addon)}
                className={`flex items-center pl-5 shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-4 ${
                  isAddonDisabled(addon) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                } ${isSelected(addon.addonId) ? 'border-l-5' : ''}`}
                style={{
                  borderLeftColor: isSelected(addon.addonId) ? commerceData?.commercePrimaryColor || '#2563eb' : ''
                }}
              >
                <Checkbox
                  isSelected={isSelected(addon.addonId)}
                  onValueChange={checked => !isAddonDisabled(addon) && handleSelectionChange(checked, addon)}
                  color='secondary'
                  isDisabled={isAddonDisabled(addon)}
                  classNames={{
                    wrapper: isAddonDisabled(addon) ? 'cursor-not-allowed' : 'cursor-pointer'
                  }}
                >
                  <div className='flex flex-col gap-1'>
                    <span className='text-base pl-4'>{addon.name}</span>
                    {addon.price > 0 && (
                      <span className='text-small text-gray-600 pl-4'>+ Gs. {thousandsSeparator(addon.price)}</span>
                    )}
                  </div>
                </Checkbox>
              </div>
            ))}
          </div>
          {hasAddonLimits && (
            <div className='mt-4 text-sm text-gray-500'>
              Seleccionados: {selectedCount} de {maxAddons}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onPress={handleConfirm}
            className='w-full'
            style={{
              backgroundColor: `${commerceData?.commercePrimaryColor}`
            }}
            isDisabled={hasAddonLimits && selectedCount < minAddons}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
