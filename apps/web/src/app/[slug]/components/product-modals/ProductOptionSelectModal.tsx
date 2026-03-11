import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio } from '@heroui/react'
import { ProductOption } from '@/types/AdminProduct'
import usePublicCart from '@/store/publicCart'
import { thousandsSeparator } from '@/utils/price'
import usePublicCommerceStore from '@/store/publicCommerce'
import { useWindowSize } from '@/hooks/useWindowSize'

interface ProductOptionSelectModalProps {
  isOpen: boolean
  onClose: () => void
  options: ProductOption
  productBasePrice: number
}

export default function ProductOptionSelectModal({
  isOpen,
  onClose,
  options,
  productBasePrice
}: ProductOptionSelectModalProps) {
  const setWorkingOption = usePublicCart(state => state.setWorkingOption)
  const commitWorkingSelections = usePublicCart(state => state.commitWorkingSelections)
  const workingSelections = usePublicCart(state => state.workingSelections)
  const businessColor = usePublicCommerceStore(state => state.commerce?.commercePrimaryColor)
  const isPrimaryColorLight = usePublicCommerceStore(state => state.isPrimaryColorLight)
  const initializeWorkingSelections = usePublicCart(state => state.initializeWorkingSelections)
  const temporarySelections = usePublicCart(state => state.temporarySelections)
  const isDesktop = useWindowSize()

  const textColor = isPrimaryColorLight ? '#000' : '#fff'

  // Inicializar working selections cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      initializeWorkingSelections(temporarySelections)
    }
  }, [isOpen])

  const handleSelectionChange = (valueId: string) => {
    const selectedValue = options.values.find(value => value.optionValueId === valueId)
    if (selectedValue) {
      setWorkingOption({
        optionId: options.optionId,
        valueId: selectedValue.optionValueId,
        name: selectedValue.name,
        price: selectedValue.price || productBasePrice
      })
    }
  }

  const handleConfirm = () => {
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
          <h3 className='text-lg font-semibold'>{options.name}</h3>
        </ModalHeader>
        <ModalBody className='bg-[#F9F7F4] overflow-scroll'>
          <RadioGroup value={workingSelections.selectedOption?.valueId || ''} onValueChange={handleSelectionChange}>
            {options.values.map(value => (
              <div
                key={value.optionValueId}
                className={`flex items-center pl-5 shadow-md border-l-5 border-transparent rounded-lg bg-white mb-3 py-2 cursor-pointer ${
                  workingSelections.selectedOption?.valueId === value.optionValueId ? `border-l-5` : ''
                }`}
                onClick={() => handleSelectionChange(value.optionValueId)}
                style={{
                  borderLeftColor:
                    workingSelections.selectedOption?.valueId === value.optionValueId ? businessColor || '#2563eb' : ''
                }}
              >
                <Radio
                  value={value.optionValueId}
                  className='max-w-full'
                  color='secondary'
                  classNames={{ wrapper: 'cursor-pointer' }}
                >
                  <div className='flex flex-col gap-1'>
                    <span className='text-base pl-4'>{value.name}</span>
                    <span className='text-small text-gray-600 pl-4'>
                      Gs. {thousandsSeparator(value.price || productBasePrice)}
                    </span>
                  </div>
                </Radio>
              </div>
            ))}
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            className='w-full'
            onPress={handleConfirm}
            style={{
              backgroundColor: businessColor || '#2563eb',
              color: textColor
            }}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
