import Image from 'next/image'

interface TableHeaderProps {
  banner: string
  logo: string
  tableNumber: number
  totalAmount: string
}

export default function TableHeader({ banner, logo, tableNumber, totalAmount }: TableHeaderProps) {
  return (
    <>
      {/* Banner */}
      <div className='relative'>
        <Image
          src={banner}
          alt='Banner del comercio'
          width={800}
          height={200}
          className='w-full h-40 sm:h-48 object-cover'
        />
        {/* Logo circular sobre el banner */}
        <div className='absolute -bottom-10 left-1/2 transform -translate-x-1/2'>
          <div className='w-32 h-32 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg'>
            <Image src={logo} alt='Logo del comercio' width={130} height={130} className='w-full h-full object-cover' />
          </div>
        </div>
      </div>

      {/* Número de mesa y total */}
      <div className='pt-12 pb-4 px-4 border border-b-1 mb-5'>
        <h2 className='text-base text-gray-700 text-center my-3'>Mesa {tableNumber}</h2>
        <div className='flex justify-between items-center'>
          <span className='text-lg text-gray-800'>Por pagar</span>
          <span className='text-xl sm:text-1xl font-bold text-gray-900'>{totalAmount}</span>
        </div>
      </div>
    </>
  )
}
