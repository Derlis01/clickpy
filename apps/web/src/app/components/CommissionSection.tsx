'use client'

import { Card, Chip } from '@heroui/react'
import ClickpyLogo from '../../../public/icon1.png'

export default function CommissionSection() {
  return (
    <section className='py-20 bg-gradient-to-b from-gray-50 to-white'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Header with better spacing */}
        <div className='text-center mb-16'>
          <div>
            <Chip color='success' variant='flat' size='lg' className='mb-6'>
              Sin Comisiones
            </Chip>
          </div>
          <h2 className='text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight'>
            Quedáte con <span className='text-green-600'>todas tus ventas</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            Otras plataformas se quedan con parte de cada venta. Con Clickpy, cada peso que vendés es tuyo.
          </p>
        </div>

        {/* Simple comparison */}
        <div className='bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100'>
          <div className='text-center mb-10'>
            <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-3'>Comisiones por cada venta</h3>
          </div>

          {/* Main comparison */}
          <div className='flex flex-col md:flex-row md:justify-between gap-8'>
            {/* Otras plataformas */}
            <div className='md:flex-1 md:max-w-sm'>
              <Card className='p-8 bg-red-50 border-2 border-red-100 text-center h-full'>
                <div className='mb-6'>
                  <div className='bg-red-100 p-3 rounded-xl inline-flex'>
                    <div className='w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center'>
                      <span className='text-white font-bold text-lg'>P</span>
                    </div>
                  </div>
                </div>
                <h4 className='font-bold text-gray-800 text-xl mb-4'>Otras plataformas</h4>
                <div className='text-5xl md:text-6xl font-bold text-red-600 mb-2'>30%</div>
                <p className='text-gray-600'>de comisión por cada venta</p>
              </Card>
            </div>

            {/* Clickpy */}
            <div className='md:flex-1 md:max-w-sm'>
              <Card className='p-8 bg-green-50 border-2 border-green-200 text-center h-full'>
                <div className='mb-6'>
                  <div className='p-3 rounded-xl inline-flex'>
                    <div className='w-14 h-14 flex items-center justify-center'>
                      <img src={ClickpyLogo.src} alt='Clickpy' className='w-full h-full object-contain' />
                    </div>
                  </div>
                </div>
                <h4 className='font-bold text-gray-800 text-xl mb-4'>Con Clickpy</h4>
                <div className='text-5xl md:text-6xl font-bold text-green-600 mb-2'>0%</div>
                <p className='text-gray-600'>sin comisiones por venta</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
