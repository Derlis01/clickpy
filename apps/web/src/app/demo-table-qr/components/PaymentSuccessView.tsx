import { Button, Card, CardBody, Input } from '@heroui/react'
import { useState } from 'react'
import QRIcon from '../../../../public/qr-icon'
import { CheckCircle } from 'react-feather'

interface PaymentSuccessViewProps {
  tableNumber: number
  commerceName: string
  finalTotal: number
  formatPrice: (price: number) => string
  invoiceAddress: string
  setInvoiceAddress: (address: string) => void
  onConfirm: () => void
}

// Ícono de check verde usando CheckCircle de react-feather
const CheckIcon = () => (
  <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
    <CheckCircle className='w-12 h-12 text-green-600' />
  </div>
)

// Ícono de email
const EmailIcon = () => (
  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    />
  </svg>
)

export default function PaymentSuccessView({
  tableNumber,
  commerceName,
  finalTotal,
  formatPrice,
  invoiceAddress,
  setInvoiceAddress,
  onConfirm
}: PaymentSuccessViewProps) {
  const [isValidEmail, setIsValidEmail] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (value: string) => {
    setInvoiceAddress(value)
    setIsValidEmail(validateEmail(value))
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <div className='max-w-md mx-auto w-full flex-1 bg-white'>
        <div className='p-4'>
          {/* Header con check verde */}
          <div className='text-center py-8'>
            <CheckIcon />
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>¡Pago realizado!</h1>
            <p className='text-gray-600 mb-1'>
              Mesa {tableNumber} • {commerceName}
            </p>
            <p className='text-xl font-semibold text-green-600'>{formatPrice(finalTotal)}</p>
          </div>

          {/* Card para dirección de factura */}
          <Card className='mb-6'>
            <CardBody className='p-4 sm:p-6'>
              <div className='space-y-4'>
                <div className='text-center mb-4'>
                  <h2 className='text-lg font-semibold text-gray-900 mb-2'>Recibe tu factura</h2>
                  <p className='text-sm text-gray-600'>
                    Te enviaremos la factura de tu compra al correo que nos proporciones
                  </p>
                </div>

                <Input
                  type='email'
                  label='Correo electrónico'
                  placeholder='ejemplo@correo.com'
                  value={invoiceAddress}
                  onValueChange={handleEmailChange}
                  startContent={<EmailIcon />}
                  variant='bordered'
                  size='lg'
                  isInvalid={invoiceAddress.length > 0 && !isValidEmail}
                  errorMessage={invoiceAddress.length > 0 && !isValidEmail ? 'Ingresa un correo válido' : ''}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Bottom button */}
      <div className='bg-white border-t border-gray-200 shadow-lg'>
        <div className='max-w-md mx-auto w-full px-4 py-3 pb-safe'>
          <Button
            onPress={onConfirm}
            className='w-full py-4 sm:py-6 text-base sm:text-lg font-semibold'
            color='secondary'
            size='lg'
            radius='lg'
            isDisabled={!isValidEmail}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
