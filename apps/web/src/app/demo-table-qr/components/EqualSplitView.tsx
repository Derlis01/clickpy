import { Button, Card, CardBody } from '@heroui/react'

interface SplitData {
  totalPeople: number
  myParts: number
}

interface EqualSplitViewProps {
  splitData: SplitData
  setSplitData: (data: SplitData | ((prev: SplitData) => SplitData)) => void
  myAmount: number
  formatPrice: (price: number) => string
  onBack: () => void
  hasModifiedPeople: boolean
  setHasModifiedPeople: (value: boolean) => void
}

// Componente para el ícono de persona
const PersonIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className={`w-6 h-6 ${filled ? 'text-black' : 'text-gray-300'}`}
    fill={filled ? 'currentColor' : 'none'}
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    />
  </svg>
)

// Componente para mostrar personas
const PeopleDisplay = ({ total, myParts }: { total: number; myParts: number }) => {
  return (
    <div className='flex flex-wrap justify-center gap-2 mt-4'>
      {Array.from({ length: total }, (_, i) => (
        <PersonIcon key={i} filled={i < myParts} />
      ))}
    </div>
  )
}

// Componente para el ícono de minus
const MinusIcon = () => (
  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
  </svg>
)

// Componente para el ícono de plus
const PlusIcon = () => (
  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
  </svg>
)

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className='relative w-24 h-24 sm:w-32 sm:h-32 mx-auto'>
      <svg className='w-full h-full transform -rotate-90' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          stroke='currentColor'
          strokeWidth='8'
          fill='transparent'
          className='text-gray-200'
        />
        <circle
          cx='50'
          cy='50'
          r={radius}
          stroke='currentColor'
          strokeWidth='8'
          fill='transparent'
          strokeDasharray={strokeDasharray}
          className='text-blue-500 transition-all duration-300 ease-in-out'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-lg sm:text-2xl font-bold text-blue-500'>{percentage}%</span>
      </div>
    </div>
  )
}

export default function EqualSplitView({
  splitData,
  setSplitData,
  myAmount,
  formatPrice,
  onBack,
  hasModifiedPeople,
  setHasModifiedPeople
}: EqualSplitViewProps) {
  const myPercentage = Math.round((splitData.myParts / splitData.totalPeople) * 100)

  const handlePeopleChange = (newTotal: number) => {
    setSplitData(prev => ({
      ...prev,
      totalPeople: newTotal,
      myParts: Math.min(prev.myParts, newTotal) // Ajustar myParts si es necesario
    }))
    setHasModifiedPeople(true)
  }

  return (
    <div className='pb-24'>
      <div className='p-4'>
        <div>
          <div className='mb-6'>
            <Button onPress={onBack} variant='light' className='mb-4' size='sm'>
              ← Volver
            </Button>
            <h1 className='text-xl sm:text-2xl font-bold text-center'>Dividir en partes iguales</h1>
          </div>

          <Card className='mb-6'>
            <CardBody className='p-4 sm:p-6'>
              <div className='space-y-8'>
                {/* Total de personas */}
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>Personas en la mesa</h3>
                  <div className='flex items-center justify-center space-x-4 mb-4'>
                    <Button
                      variant='bordered'
                      isIconOnly
                      size='lg'
                      onPress={() => handlePeopleChange(Math.max(1, splitData.totalPeople - 1))}
                      isDisabled={splitData.totalPeople <= 1}
                    >
                      <MinusIcon />
                    </Button>
                    <div className='bg-blue-50 rounded-xl px-6 py-3 min-w-[60px]'>
                      <span className='text-2xl font-bold text-black'>{splitData.totalPeople}</span>
                    </div>
                    <Button
                      variant='bordered'
                      isIconOnly
                      size='lg'
                      onPress={() => handlePeopleChange(splitData.totalPeople + 1)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  <PeopleDisplay total={splitData.totalPeople} myParts={0} />
                </div>

                {/* Solo mostrar "Vos pagas por" cuando se haya modificado las personas */}
                {hasModifiedPeople && (
                  <>
                    {/* Separador visual */}
                    <div className='border-t border-gray-200 pt-6'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2 text-center'>Vos pagas por</h3>
                      <div className='flex items-center justify-center space-x-4 mb-4'>
                        <Button
                          variant='bordered'
                          isIconOnly
                          size='lg'
                          onPress={() => setSplitData(prev => ({ ...prev, myParts: Math.max(1, prev.myParts - 1) }))}
                          isDisabled={splitData.myParts <= 1}
                        >
                          <MinusIcon />
                        </Button>
                        <div className=' bg-blue-50 rounded-xl px-6 py-3 min-w-[60px]'>
                          <span className='text-2xl font-bold text-black'>{splitData.myParts}</span>
                        </div>
                        <Button
                          variant='bordered'
                          isIconOnly
                          size='lg'
                          onPress={() =>
                            setSplitData(prev => ({ ...prev, myParts: Math.min(prev.totalPeople, prev.myParts + 1) }))
                          }
                          isDisabled={splitData.myParts >= splitData.totalPeople}
                        >
                          <PlusIcon />
                        </Button>
                      </div>
                      <PeopleDisplay total={splitData.totalPeople} myParts={splitData.myParts} />
                    </div>

                    {/* Resumen - Solo mostrar cuando se haya modificado */}
                    <div className='bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='text-sm text-gray-600'>A pagar</p>
                        </div>
                        <span className='text-2xl font-bold text-gray-900'>{formatPrice(myAmount)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
