import { Button, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'

interface PaymentOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onOptionSelect: (option: 'equal' | 'select') => void
}

export default function PaymentOptionsModal({ isOpen, onClose, onOptionSelect }: PaymentOptionsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement='bottom'
      backdrop='blur'
      size='xl'
      style={{ marginBottom: 0, marginInline: 0, maxWidth: '448px' }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut'
            }
          },
          exit: {
            y: '100%',
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn'
            }
          }
        }
      }}
    >
      <ModalContent>
        <ModalHeader className='text-center pb-2 pt-4'>
          <h4 className='text-lg font-semibold'>¿Cómo deseas pagar?</h4>
        </ModalHeader>
        <ModalBody className='pb-6 px-4'>
          <div className='space-y-3'>
            <Button
              onPress={() => onOptionSelect('select')}
              variant='bordered'
              className='w-full py-4 sm:py-6 text-left justify-start h-auto mobile-button'
              radius='lg'
            >
              <div className='text-left'>
                <div className='font-semibold text-sm sm:text-base'>Elegir productos a pagar</div>
                <div className='text-xs sm:text-sm text-gray-600 mt-1'>Selecciona productos específicos</div>
              </div>
            </Button>
            <Button
              onPress={() => onOptionSelect('equal')}
              variant='bordered'
              className='w-full py-4 sm:py-6 text-left justify-start h-auto mobile-button'
              radius='lg'
            >
              <div className='text-left'>
                <div className='font-semibold text-sm sm:text-base'>Dividir en partes iguales</div>
                <div className='text-xs sm:text-sm text-gray-600 mt-1'>Especifica cuántas personas y partes pagas</div>
              </div>
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
