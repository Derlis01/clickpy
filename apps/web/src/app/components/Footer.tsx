import { Divider, Link as HeroLink, Image } from '@heroui/react'
import Logo from '../../../public/icon1.png'
import { Instagram } from 'react-feather'

export default function Footer() {
  return (
    <footer className='bg-gray-900 text-white py-12'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='md:col-span-2'>
            <div className='flex items-center space-x-2 mb-4'>
              <img src={Logo.src} alt='Clickpy Logo' width={50} height={50} />
              <span className='text-xl font-bold'>Clickpy</span>
            </div>
            <p className='text-gray-400 max-w-md mb-6'>
              Crea tu tienda online sin comisiones. Recibe pedidos por WhatsApp y pronto gestiona tu negocio con
              inteligencia artificial.
            </p>
            <div className='flex space-x-4'>
              <HeroLink
                href='https://www.instagram.com/clickpy.app/'
                target='_blank'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <div className='w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors'>
                  <Instagram size={16} />
                </div>
              </HeroLink>
            </div>
          </div>

          <div>
            <h3 className='font-bold mb-4'>Producto</h3>
            <div className='space-y-2'>
              <HeroLink href='#precios' className='block text-gray-400 hover:text-white transition-colors'>
                Precios
              </HeroLink>
              <HeroLink
                href='https://clickpy.app/restaurante-de-prueba'
                target='_blank'
                className='block text-gray-400 hover:text-white transition-colors'
              >
                Demo
              </HeroLink>
              <HeroLink href='#preguntas' className='block text-gray-400 hover:text-white transition-colors'>
                Preguntas Frecuentes
              </HeroLink>
            </div>
          </div>

          <div>
            <h3 className='font-bold mb-4'>Soporte</h3>
            <div className='space-y-2'>
              <HeroLink
                href='https://wa.me/595972885139'
                target='_blank'
                className='block text-gray-400 hover:text-white transition-colors'
              >
                WhatsApp
              </HeroLink>
            </div>
          </div>
        </div>

        <Divider className='my-8 bg-gray-800' />
        <div className='flex flex-col md:flex-row justify-center items-center'>
          <p className='text-gray-500 text-sm'>© 2025 clickpy. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
