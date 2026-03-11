'use client'

import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { InputType } from '../LocalInputAdmin'
import useCommerceStore from '@/store/commerceStore'
import { modalHeaderMap } from '@/constants/admin/modalHeaderMap'
import { placeholderMap } from '@/constants/admin/placeHolderMap'
import { stateFieldMap } from '@/constants/admin/stateFieldMap'
import { useState } from 'react'
import { toast } from 'sonner'

interface LocalInputModalProps {
  inputType: InputType
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function LocalInputModal({ isOpen, onOpenChange, inputType }: LocalInputModalProps) {
  const { setField, ...state } = useCommerceStore()
  const isLoading = useCommerceStore(state => state.isLoading)
  const initialState = state[stateFieldMap[inputType] as keyof typeof state]
  const [value, setValue] = useState(typeof initialState === 'string' ? initialState : '')

  const closeModalHandler = (closeModal: () => void) => {
    closeModal()
  }

  const handleSave = async () => {
    const key = stateFieldMap[inputType]
    const result = await setField(key as keyof typeof state, value)
    onOpenChange(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success, {
        duration: 5000
      })
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='sm' placement='center'>
        <ModalContent>
          {closeModal => (
            <>
              <ModalHeader className='flex flex-col gap-1'>{modalHeaderMap[inputType]}</ModalHeader>
              <ModalBody className='flex items-center'>
                <div className='py-6 w-full'>
                  {inputType === 'commercePrimaryColor' ? (
                    <div className='flex items-center justify-between'>
                      <span className='mb-3 text-black'>Eliger un color:</span>
                      <Input
                        type='color'
                        placeholder={placeholderMap[inputType]}
                        className='w-9'
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        variant='underlined'
                      />
                    </div>
                  ) : (
                    <Input
                      placeholder={placeholderMap[inputType]}
                      className='w-full'
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      variant='underlined'
                      startContent={
                        inputType === 'commerceSlug' ? (
                          <div className='pointer-events-none flex items-center'>
                            <span className='text-default-400 text-small'>https://clickpy.app/</span>
                          </div>
                        ) : undefined
                      }
                    />
                  )}
                </div>
              </ModalBody>
              <div className='flex gap-4 px-6 py-5'>
                <Button
                  onPress={() => closeModalHandler(closeModal)}
                  size='md'
                  variant='flat'
                  radius='sm'
                  className='w-full px-5'
                >
                  Cancelar
                </Button>
                <Button
                  color='primary'
                  isLoading={isLoading}
                  size='md'
                  onPress={handleSave}
                  radius='sm'
                  className='w-full px-5'
                >
                  Guardar
                </Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
