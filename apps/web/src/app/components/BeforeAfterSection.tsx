import { Image } from '@heroui/react'
import { ArrowRight } from 'react-feather'

export default function BeforeAfterSection() {
  return (
    <section className='py-16 md:py-24 bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>Adiós al Caos de Pedidos</h2>
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
            ¿Cansado de anotar pedidos, repetir precios y sumar a mano? Tus clientes también quieren comprar más rápido.
          </p>
        </div>

        <div className='flex flex-col md:flex-row gap-8 md:gap-16 items-center' style={{ minHeight: '500px' }}>
          {/* ANTES */}
          <div className='flex-1 w-full'>
            <div className='mb-8'>
              <h3 className='text-2xl font-semibold text-gray-800 mb-4'>Antes</h3>
              <p className='text-gray-600 mb-6'>Proceso manual, lento y propenso a errores</p>
            </div>
            <div className='bg-white rounded-2xl p-6 shadow-sm'>
              <Image
                src='https://images.clickpy.app/15min.webp'
                alt='Antes sin ClickPy - proceso manual complicado'
                className='w-full h-auto rounded-xl'
              />
            </div>
          </div>

          {/* Separador visual - Desktop */}
          <div className='hidden md:flex flex-col items-center justify-center min-h-full'>
            <div className='w-px h-32 bg-gradient-to-b from-transparent via-gray-300 to-transparent'></div>
            <div className='w-12 h-12 rounded-full bg-primary flex items-center justify-center my-6 shadow-lg'>
              <span className='text-white text-lg'>
                <ArrowRight />
              </span>
            </div>
            <div className='w-px h-32 bg-gradient-to-b from-transparent via-gray-300 to-transparent'></div>
          </div>

          {/* Separador visual - Mobile */}
          <div className='flex md:hidden items-center justify-center w-full py-8'>
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
            <div className='w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-6 shadow-lg'>
              <span className='text-white text-lg rotate-90'>
                <ArrowRight />
              </span>
            </div>
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
          </div>

          {/* CON CLICKPY */}
          <div className='flex-1 w-full'>
            <div className='mb-8'>
              <h3 className='text-2xl font-semibold text-gray-800 mb-4'>Con ClickPy</h3>
              <p className='text-gray-600 mb-6'>Automatizado, rápido y sin errores</p>
            </div>
            <div className='bg-white rounded-2xl p-6 shadow-sm'>
              <Image
                src='https://images.clickpy.app/1.webp'
                alt='Con ClickPy - proceso automatizado y simple'
                className='w-full h-auto rounded-xl'
              />
            </div>
          </div>
        </div>

        <div className='text-center mt-12'>
          <p className='text-lg text-gray-600 font-medium'>
            Tus clientes eligen de tu catálogo online. Tú recibes el pedido listo en WhatsApp. ¡Así de simple!
          </p>
        </div>
      </div>
    </section>
  )
}
