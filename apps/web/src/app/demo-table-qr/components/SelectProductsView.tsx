import { Button, Card, CardBody, Chip } from '@heroui/react'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  orderedBy: string
}

interface SelectProductsViewProps {
  groupedByDiner: Record<string, OrderItem[]>
  selectedItems: number[]
  myAmount: number
  formatPrice: (price: number) => string
  onBack: () => void
  toggleItemSelection: (itemId: number) => void
  selectAllFromDiner: (diner: string) => void
  clearSelection: () => void
}

// Ícono de más
const PlusIcon = () => (
  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
  </svg>
)

// Ícono de check
const CheckIcon = () => (
  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
  </svg>
)

// Ícono de menos
const MinusIcon = () => (
  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
  </svg>
)

export default function SelectProductsView({
  groupedByDiner,
  selectedItems,
  myAmount,
  formatPrice,
  onBack,
  toggleItemSelection,
  selectAllFromDiner,
  clearSelection
}: SelectProductsViewProps) {
  // Función para verificar si todos los items de un comensal están seleccionados
  const areAllItemsSelected = (items: OrderItem[]) => {
    return items.every(item => selectedItems.includes(item.id))
  }

  return (
    <div className='pb-24'>
      <div className='p-4'>
        <div>
          <div className='mb-4'>
            <Button onPress={onBack} variant='light' className='mb-4' size='sm'>
              ← Volver
            </Button>
            <h1 className='text-xl sm:text-2xl font-bold text-center'>Elegir productos</h1>
          </div>

          {/* Resumen seleccionado */}
          <Card className='mb-4 bg-blue-50 border-blue-200'>
            <CardBody className='p-3 sm:p-4'>
              <div className='flex justify-between items-center'>
                <span className='font-semibold text-sm sm:text-base'>Total seleccionado:</span>
                <span className='text-lg sm:text-xl font-bold text-blue-600'>{formatPrice(myAmount)}</span>
              </div>
            </CardBody>
          </Card>

          {/* Productos agrupados por comensal */}
          <div className='space-y-3 mb-6'>
            {Object.entries(groupedByDiner).map(([diner, items]) => {
              const allSelected = areAllItemsSelected(items)

              return (
                <Card key={diner}>
                  <CardBody className='p-3 sm:p-4'>
                    <div className='flex justify-between items-center mb-3'>
                      <h3 className='font-semibold text-gray-900 text-sm sm:text-base'>{diner}</h3>
                      <Button
                        isIconOnly
                        variant={allSelected ? 'solid' : 'bordered'}
                        color={allSelected ? 'secondary' : 'default'}
                        size='sm'
                        onPress={() => selectAllFromDiner(diner)}
                      >
                        {allSelected ? <CheckIcon /> : <PlusIcon />}
                      </Button>
                    </div>

                    <div className='space-y-2'>
                      {items.map(item => (
                        <div
                          key={item.id}
                          className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
                        >
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <Chip variant='flat' size='sm' className='text-xs flex-shrink-0'>
                                {item.quantity}x
                              </Chip>
                              <span className='text-xs sm:text-sm font-medium truncate'>{item.name}</span>
                            </div>
                            <span className='text-xs text-gray-600'>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                          <Button
                            isIconOnly
                            color={selectedItems.includes(item.id) ? 'secondary' : 'default'}
                            variant={selectedItems.includes(item.id) ? 'solid' : 'bordered'}
                            size='sm'
                            className='ml-2 flex-shrink-0'
                            onPress={() => toggleItemSelection(item.id)}
                          >
                            {selectedItems.includes(item.id) ? <CheckIcon /> : <PlusIcon />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
