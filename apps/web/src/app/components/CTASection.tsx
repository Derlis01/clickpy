'use client'

import { Button } from '@heroui/react'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className='py-16 md:py-20 bg-[#374bff]' id='contacto'>
      <div className='max-w-6xl mx-auto px-4 text-center'>
        <h2 className='text-3xl md:text-4xl font-bold text-white mb-8'>Tu Negocio Merece las Mejores Herramientas</h2>
        <p className='text-lg text-blue-100 max-w-3xl mx-auto mb-10'>
          Imagina ventas más fáciles, marketing efectivo y un asesor inteligente trabajando para ti. Todo sin comisiones
          que frenen tu progreso.
        </p>

        <div className='space-y-6'>
          <Link href='/register'>
            <Button
              size='lg'
              className='bg-white text-[#374bff] hover:bg-gray-100 px-12 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all'
            >
              Crear Mi Tienda Gratis Ahora
            </Button>
          </Link>
          <p className='text-blue-100 text-lg'>0% Comisiones. Sin Contratos. Crecimiento Real.</p>
        </div>
      </div>
    </section>
  )
}
