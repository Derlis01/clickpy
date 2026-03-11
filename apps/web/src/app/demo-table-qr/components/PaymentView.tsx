import { Button, Card, CardBody } from '@heroui/react'
import { CreditCard } from 'react-feather'
import QRIcon from '../../../../public/qr-icon'

interface PaymentViewProps {
  tableNumber: number
  commerceName: string
  myAmount: number
  tip: { amount: number }
  platformFee: number
  tax: number
  finalTotal: number
  waiterName: string
  formatPrice: (price: number) => string
  onBack: () => void
  onApplePay: () => void
  onGooglePay: () => void
  onQRPay: () => void
  onCreditCard: () => void
}

// Ícono de Apple Pay
const ApplePayIcon = () => (
  <svg className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
  </svg>
)

// Ícono de Google Pay
const GooglePayIcon = () => (
  <svg className='w-6 h-6' viewBox='0 0 24 24' fill='#FFF'>
    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
  </svg>
)

export default function PaymentView({
  tableNumber,
  commerceName,
  myAmount,
  tip,
  platformFee,
  tax,
  finalTotal,
  waiterName,
  formatPrice,
  onBack,
  onApplePay,
  onGooglePay,
  onQRPay,
  onCreditCard
}: PaymentViewProps) {
  return (
    <div className='pb-24'>
      <div className='p-4'>
        <div>
          <div className='mb-6'>
            <Button onPress={onBack} variant='light' className='mb-4' size='sm'>
              ← Volver
            </Button>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold mb-2'>¡Listo para pagar!</h1>
              <p className='text-gray-600'>
                Mesa {tableNumber} • {commerceName}
              </p>
            </div>
          </div>

          {/* Detalle simplificado */}
          <Card className='mb-6'>
            <CardBody className='p-4 sm:p-6'>
              <div className='space-y-4'>
                {/* Total principal */}
                <div className='text-center pb-4 border-b'>
                  <p className='text-sm text-gray-600 mb-1'>Total a pagar</p>
                  <p className='text-4xl font-bold text-blue-600'>{formatPrice(finalTotal)}</p>
                </div>

                {/* Desglose simple */}
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Productos (IVA Inc.)</span>
                    <span>{formatPrice(myAmount)}</span>
                  </div>

                  {tip.amount > 0 && (
                    <div className='flex justify-between'>
                      <span>Propina para {waiterName}</span>
                      <span>{formatPrice(tip.amount)}</span>
                    </div>
                  )}

                  <div className='flex justify-between text-xs text-gray-600'>
                    <span>Tarifa operativa (1.1%)</span>
                    <span>{formatPrice(platformFee)}</span>
                  </div>

                  {/* <div className='flex justify-between text-xs text-gray-600'>
                    <span>Impuesto (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div> */}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Métodos de pago */}
          <div className='space-y-3'>
            <Button
              className='w-full py-6 text-lg font-semibold bg-black text-white hover:bg-gray-800'
              onPress={onApplePay}
              startContent={<ApplePayIcon />}
              size='lg'
            >
              Apple Pay
            </Button>

            <Button
              className='w-full py-6 text-lg font-semibold'
              color='primary'
              onPress={onGooglePay}
              startContent={<GooglePayIcon />}
              size='lg'
            >
              Google Pay
            </Button>

            <Button
              variant='bordered'
              className='w-full py-6 text-lg font-semibold border-2'
              onPress={onQRPay}
              startContent={<QRIcon />}
              size='lg'
            >
              Pagar con QR
            </Button>

            <Button
              variant='bordered'
              className='w-full py-6 text-lg font-semibold border-2'
              onPress={onCreditCard}
              startContent={<CreditCard />}
              size='lg'
            >
              Tarjeta de crédito
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
