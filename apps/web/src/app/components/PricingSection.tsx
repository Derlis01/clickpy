'use client'

import { Card, CardBody, Button, Chip, Divider } from '@heroui/react'
import { Check, X, Star, Zap, Users, Package, Truck, Link2, Clock, Headphones } from 'react-feather'
import QRIcon from '../../../public/qr-icon'

export default function PricingSection() {
  const features = {
    free: [
      { name: 'Hasta 10 productos', included: true, icon: Package },
      { name: 'Catálogo básico', included: true, icon: Check },
      { name: 'Productos ilimitados', included: false, icon: X },
      { name: 'QR del negocio', included: false, icon: X },
      { name: 'Pedidos ilimitados', included: false, icon: X },
      { name: 'Link único personalizado', included: false, icon: X },
      { name: 'Clientes ilimitados', included: false, icon: X },
      { name: 'Delivery y retiro', included: false, icon: X },
      { name: 'Atención 24/7', included: false, icon: X },
      { name: 'Actualizaciones automáticas', included: false, icon: X }
    ],
    pro: [
      { name: 'Productos ilimitados', included: true, icon: Package },
      { name: 'QR del negocio', included: true, icon: QRIcon },
      { name: 'Pedidos ilimitados', included: true, icon: Zap },
      { name: 'Link único personalizado', included: true, icon: Link2 },
      { name: 'Clientes ilimitados', included: true, icon: Users },
      { name: 'Delivery y retiro', included: true, icon: Truck },
      { name: 'Atención al cliente 24/7', included: true, icon: Headphones },
      { name: 'Actualizaciones automáticas', included: true, icon: Check },
      { name: 'Panel de administración completo', included: true, icon: Check },
      { name: 'Soporte prioritario', included: true, icon: Star }
    ]
  }

  return (
    <section id='precios' className='py-16 md:py-24 bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            <span className='text-[#374bff]'>Planes Simples</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>Elige el plan que mejor se adapte a tu negocio</p>
        </div>

        {/* Pricing Cards */}
        <div className='grid md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
          {/* Free Plan */}
          <Card className='border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow'>
            <CardBody className='p-8'>
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>Gratis</h3>
                <p className='text-gray-600 mb-6'>Para empezar</p>
                <div className='mb-6'>
                  <span className='text-4xl font-bold text-gray-900'>Gs. 0</span>
                  <span className='text-gray-600 ml-2'>siempre</span>
                </div>
              </div>

              <Divider className='mb-6' />

              <div className='space-y-4 mb-8'>
                <h4 className='font-semibold text-gray-900 mb-4'>Incluye:</h4>
                {features.free.map((feature, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    {feature.included ? (
                      <div className='p-1 bg-green-100 rounded-full'>
                        <Check size={16} className='text-green-600' />
                      </div>
                    ) : (
                      <div className='p-1 bg-gray-100 rounded-full'>
                        <X size={16} className='text-gray-400' />
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Pro Plan */}
          <Card className='border-2 border-[#374bff] shadow-xl hover:shadow-2xl transition-shadow'>
            <CardBody className='p-8'>
              <div className='text-center mb-8'>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>Emprendedor</h3>
                <p className='text-gray-600 mb-6'>Para crecer</p>

                {/* Promotional Pricing */}
                <div className='mb-6'>
                  <div className='flex items-center justify-center gap-2 mb-4'>
                    <Chip color='success' variant='flat' size='sm'>
                      50% OFF
                    </Chip>
                  </div>
                  <div className='flex flex-col items-center gap-2 sm:flex-row sm:justify-center'>
                    <span className='text-lg sm:text-2xl text-[#374bff]'>Gs. 150.000</span>
                    {/* <span className='text-3xl sm:text-4xl font-bold text-[#374bff]'>Gs. 75.000</span> */}
                  </div>
                  <p className='text-gray-600 mt-2'>por mes</p>
                </div>
              </div>

              <Divider className='mb-6' />

              <div className='space-y-4 mb-8'>
                <h4 className='font-semibold text-gray-900 mb-4'>Todo incluido:</h4>
                {features.pro.map((feature, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    <div className='p-1 bg-[#374bff]/10 rounded-full'>
                      <Check size={16} className='text-[#374bff]' />
                    </div>
                    <span className='text-sm text-gray-900 font-medium'>{feature.name}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  )
}
