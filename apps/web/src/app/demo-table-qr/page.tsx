'use client'

import { useState } from 'react'
import './demo.css'
import TableHeader from './components/TableHeader'
import OrderSummary from './components/OrderSummary'
import MobileBottomBar from './components/MobileBottomBar'
import PaymentOptionsModal from './components/PaymentOptionsModal'
import EqualSplitView from './components/EqualSplitView'
import SelectProductsView from './components/SelectProductsView'
import TipView from './components/TipView'
import PaymentView from './components/PaymentView'
import PaymentSuccessView from './components/PaymentSuccessView'

// Datos de ejemplo hardcodeados
const COMMERCE_DATA = {
  name: 'Restaurante Demo',
  logo: 'https://pub-990cb0123a7d4edea189289a4f3c3014.r2.dev/logo-commerce_a523b2d7-cc70-444c-91c0-6e3887ca9794-1742845048505.png',
  banner:
    'https://pub-990cb0123a7d4edea189289a4f3c3014.r2.dev/banner-commerce_a523b2d7-cc70-444c-91c0-6e3887ca9794-1742845078107.png'
}

const TABLE_ORDER = {
  tableNumber: 7,
  waiterName: 'Pedro',
  items: [
    { id: 1, name: 'Pizza de pepperoni', price: 55000, quantity: 1, orderedBy: 'Persona 1' },
    { id: 2, name: 'Hamburguesa', price: 45000, quantity: 2, orderedBy: 'Persona 1' },
    { id: 3, name: 'Papas con cheddar', price: 35000, quantity: 1, orderedBy: 'Persona 2' },
    { id: 4, name: 'Ensalada de pollo', price: 33000, quantity: 1, orderedBy: 'Persona 2' },
    { id: 5, name: 'Pollo frito', price: 35000, quantity: 2, orderedBy: 'Persona 3' },
    { id: 6, name: 'Taco mexicano', price: 15000, quantity: 3, orderedBy: 'Persona 3' },
    { id: 7, name: 'Papas con ajonesa', price: 18000, quantity: 2, orderedBy: 'Persona 4' }
  ]
}

type FlowStep = 'main' | 'equal-split' | 'select-products' | 'tip' | 'payment' | 'payment-success'

export default function DemoTableQRPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('main')
  const [showModal, setShowModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [splitData, setSplitData] = useState({
    totalPeople: 4,
    myParts: 1
  })
  const [hasModifiedPeople, setHasModifiedPeople] = useState(false)
  // track whether user chose equal split or selecting products
  const [splitMode, setSplitMode] = useState<'equal' | 'select'>('equal')
  const [tip, setTip] = useState({
    percentage: 0,
    amount: 0
  })
  const [invoiceAddress, setInvoiceAddress] = useState('')

  const totalAmount = TABLE_ORDER.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const groupedByDiner = TABLE_ORDER.items.reduce(
    (acc, item) => {
      if (!acc[item.orderedBy]) {
        acc[item.orderedBy] = []
      }
      acc[item.orderedBy].push(item)
      return acc
    },
    {} as Record<string, typeof TABLE_ORDER.items>
  )

  const calculateMyAmount = () => {
    // Use the chosen split mode (equal or select) regardless of the current step
    if (splitMode === 'equal') {
      return (totalAmount * splitData.myParts) / splitData.totalPeople
    }

    // splitMode === 'select'
    return selectedItems.reduce((sum, itemId) => {
      const item = TABLE_ORDER.items.find(i => i.id === itemId)
      return sum + (item ? item.price * item.quantity : 0)
    }, 0)
  }

  // Handlers
  const handleSplitOption = (option: 'equal' | 'select') => {
    setShowModal(false)
    // remember chosen split mode so amount calculation persists across steps
    if (option === 'equal') {
      setSplitMode('equal')
      setHasModifiedPeople(false) // Resetear cuando entramos a equal-split
      setCurrentStep('equal-split')
    } else {
      setSplitMode('select')
      setCurrentStep('select-products')
    }
  }

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      const next = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
      // if user is selecting items, treat mode as 'select'
      if (next.length > 0) setSplitMode('select')
      return next
    })
  }

  const selectAllFromDiner = (diner: string) => {
    const dinerItems = groupedByDiner[diner].map(item => item.id)
    setSelectedItems(prev => {
      const newSet = new Set([...prev, ...dinerItems])
      return Array.from(newSet)
    })
  }

  const proceedToTip = () => {
    setCurrentStep('tip')
  }

  const setTipPercentage = (percentage: number) => {
    const myAmount = calculateMyAmount()
    const tipAmount = (myAmount * percentage) / 100
    setTip({ percentage, amount: tipAmount })
  }

  const setCustomTip = (amount: number) => {
    setTip({ percentage: 0, amount })
  }

  const proceedToPayment = () => {
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = () => {
    setCurrentStep('payment-success')
  }

  const handleFinalConfirmation = () => {
    // Aquí se podría hacer la llamada a la API para enviar la factura
    alert(`Factura enviada a: ${invoiceAddress}`)
    // Reiniciar el flujo o redireccionar
    setCurrentStep('main')
    setInvoiceAddress('')
  }

  const getPreviousStep = (): FlowStep => {
    switch (currentStep) {
      case 'equal-split':
        return 'main'
      case 'select-products':
        return 'main'
      case 'tip':
        return selectedItems.length > 0 ? 'select-products' : 'equal-split'
      case 'payment':
        return 'tip'
      case 'payment-success':
        return 'payment'
      default:
        return 'main'
    }
  }

  const handleBack = () => {
    const previousStep = getPreviousStep()
    setCurrentStep(previousStep)

    // Si regresamos desde equal-split, resetear el estado de modificación
    if (currentStep === 'equal-split') {
      setHasModifiedPeople(false)
    }
  }

  // Render based on current step
  if (currentStep === 'equal-split') {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='max-w-md mx-auto w-full flex-1 bg-white'>
          <EqualSplitView
            splitData={splitData}
            setSplitData={setSplitData}
            myAmount={calculateMyAmount()}
            formatPrice={formatPrice}
            onBack={handleBack}
            hasModifiedPeople={hasModifiedPeople}
            setHasModifiedPeople={setHasModifiedPeople}
          />
        </div>
        <MobileBottomBar
          onAction={proceedToTip}
          actionText='Continuar'
          showPrice={true}
          price={formatPrice(calculateMyAmount())}
          isDisabled={!hasModifiedPeople}
        />
      </div>
    )
  }

  if (currentStep === 'select-products') {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='max-w-md mx-auto w-full flex-1 bg-white'>
          <SelectProductsView
            groupedByDiner={groupedByDiner}
            selectedItems={selectedItems}
            myAmount={calculateMyAmount()}
            formatPrice={formatPrice}
            onBack={handleBack}
            toggleItemSelection={toggleItemSelection}
            selectAllFromDiner={selectAllFromDiner}
            clearSelection={() => setSelectedItems([])}
          />
        </div>
        <MobileBottomBar
          onAction={proceedToTip}
          actionText={`Continuar (${selectedItems.length} productos)`}
          isDisabled={selectedItems.length === 0}
          showPrice={true}
          price={formatPrice(calculateMyAmount())}
          // Botón secundario para limpiar selección
          showSecondary={selectedItems.length > 0}
          secondaryAction={() => setSelectedItems([])}
          secondaryText='Limpiar selección'
        />
      </div>
    )
  }

  if (currentStep === 'tip') {
    const myAmount = calculateMyAmount()
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='max-w-md mx-auto w-full flex-1 bg-white'>
          <TipView
            myAmount={myAmount}
            tip={tip}
            waiterName={TABLE_ORDER.waiterName}
            formatPrice={formatPrice}
            onBack={handleBack}
            setTipPercentage={setTipPercentage}
            setCustomTip={setCustomTip}
          />
        </div>
        <MobileBottomBar
          onAction={proceedToPayment}
          actionText='Continuar al pago'
          showPrice={true}
          price={formatPrice(myAmount + tip.amount)}
        />
      </div>
    )
  }

  if (currentStep === 'payment') {
    const myAmount = calculateMyAmount()
    const platformFee = myAmount * 0.011 // 1.1% comisión
    const tax = (myAmount + tip.amount) * 0.1 // 10% impuesto
    const finalTotal = myAmount + tip.amount + platformFee + tax

    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='max-w-md mx-auto w-full flex-1 bg-white'>
          <PaymentView
            tableNumber={TABLE_ORDER.tableNumber}
            commerceName={COMMERCE_DATA.name}
            myAmount={myAmount}
            tip={tip}
            platformFee={platformFee}
            tax={tax}
            finalTotal={finalTotal}
            waiterName={TABLE_ORDER.waiterName}
            formatPrice={formatPrice}
            onBack={handleBack}
            onApplePay={handlePaymentSuccess}
            onGooglePay={handlePaymentSuccess}
            onQRPay={handlePaymentSuccess}
            onCreditCard={handlePaymentSuccess}
          />
        </div>
      </div>
    )
  }

  if (currentStep === 'payment-success') {
    const myAmount = calculateMyAmount()
    const platformFee = myAmount * 0.011 // 1.1% comisión
    const tax = (myAmount + tip.amount) * 0.1 // 10% impuesto
    const finalTotal = myAmount + tip.amount + platformFee + tax

    return (
      <PaymentSuccessView
        tableNumber={TABLE_ORDER.tableNumber}
        commerceName={COMMERCE_DATA.name}
        finalTotal={finalTotal}
        formatPrice={formatPrice}
        invoiceAddress={invoiceAddress}
        setInvoiceAddress={setInvoiceAddress}
        onConfirm={handleFinalConfirmation}
      />
    )
  }

  // Main view (default)
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <div className='max-w-md mx-auto w-full flex-1 bg-white'>
        <TableHeader
          banner={COMMERCE_DATA.banner}
          logo={COMMERCE_DATA.logo}
          tableNumber={TABLE_ORDER.tableNumber}
          totalAmount={formatPrice(totalAmount)}
        />

        <div>
          <div>
            <OrderSummary items={TABLE_ORDER.items} formatPrice={formatPrice} />
          </div>
        </div>
      </div>

      <MobileBottomBar
        onAction={() => setShowModal(true)}
        actionText='Pagar o dividir cuenta'
        showPrice={true}
        price={formatPrice(totalAmount)}
      />

      <PaymentOptionsModal isOpen={showModal} onClose={() => setShowModal(false)} onOptionSelect={handleSplitOption} />
    </div>
  )
}
