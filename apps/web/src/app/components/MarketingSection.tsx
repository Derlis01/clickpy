'use client'

import { Card, CardBody, Tabs, Tab, Button, Chip, Badge } from '@heroui/react'
import { useState, useEffect } from 'react'
import { Heart, TrendingUp, Gift, Tag, CheckCircle, Users, BarChart, Target, Zap, Star, Clock } from 'react-feather'

export default function MarketingSection() {
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('loyalty')

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <section className='py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Header Section */}
        <div className='text-center mb-16'>
          <div className='flex justify-center mb-4'>
            <Chip color='warning' variant='flat' startContent={<Clock size={16} />} className='mb-4'>
              Próximamente
            </Chip>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            Herramientas de Marketing
            <span className='block text-[#374bff]'>Inteligentes</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
            Convierte visitantes ocasionales en clientes fieles con herramientas automáticas de fidelización y análisis
            que impulsan tus ventas sin complicaciones.
          </p>

          {/* Value Props Preview */}
          <div className='flex flex-wrap justify-center gap-4 mt-8'>
            <div className='flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full'>
              <Zap size={16} className='text-green-500' />
              <span className='text-sm font-medium'>Configuración en minutos</span>
            </div>
            <div className='flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full'>
              <Target size={16} className='text-blue-500' />
              <span className='text-sm font-medium'>+35% retención promedio</span>
            </div>
            <div className='flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full'>
              <BarChart size={16} className='text-purple-500' />
              <span className='text-sm font-medium'>Analytics en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className='flex w-full flex-col'>
          {isClient ? (
            <Tabs
              aria-label='Marketing Tools'
              variant='underlined'
              selectedKey={activeTab}
              onSelectionChange={key => setActiveTab(key as string)}
              classNames={{
                tabList: 'gap-8 w-full relative rounded-none p-0 border-b border-divider bg-white/50 backdrop-blur',
                cursor: 'w-full bg-[#374bff]',
                tab: 'max-w-fit px-6 py-4 h-auto',
                tabContent: 'group-data-[selected=true]:text-[#374bff] font-semibold'
              }}
            >
              <Tab
                key='loyalty'
                title={
                  <div className='flex items-center gap-2'>
                    <Heart size={18} />
                    <span>Programa de Fidelidad</span>
                  </div>
                }
              >
                <Card className='mt-8 shadow-xl border-0 bg-white/80 backdrop-blur'>
                  <CardBody className='p-8 md:p-12'>
                    <div className='grid md:grid-cols-5 gap-12 items-start'>
                      {/* Content Side */}
                      <div className='md:col-span-3'>
                        <div className='flex items-center gap-3 mb-6'>
                          <div className='p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl'>
                            <Heart size={24} className='text-white' />
                          </div>
                          <div>
                            <h3 className='text-2xl font-bold text-gray-900'>Programa de Fidelidad</h3>
                            <p className='text-gray-500'>Automático y personalizable</p>
                          </div>
                        </div>

                        <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                          Recompensa automáticamente a tus clientes con cada compra. Crea un ciclo de fidelidad que los
                          mantiene regresando y gastando más en cada visita.
                        </p>

                        {/* Feature Cards */}
                        <div className='grid grid-cols-2 gap-4 mb-8'>
                          <Card className='bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6'>
                            <Gift className='w-10 h-10 text-purple-600 mb-3' />
                            <h4 className='font-bold text-purple-900 mb-2'>Puntos por Compra</h4>
                            <p className='text-sm text-purple-700'>
                              1 punto = $1 peso acumulable para próximas compras
                            </p>
                          </Card>
                          <Card className='bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6'>
                            <Tag className='w-10 h-10 text-orange-600 mb-3' />
                            <h4 className='font-bold text-orange-900 mb-2'>Códigos Automáticos</h4>
                            <p className='text-sm text-orange-700'>Descuentos personalizados según comportamiento</p>
                          </Card>
                          <Card className='bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6'>
                            <Star className='w-10 h-10 text-green-600 mb-3' />
                            <h4 className='font-bold text-green-900 mb-2'>Niveles VIP</h4>
                            <p className='text-sm text-green-700'>Bronce, Plata, Oro con beneficios exclusivos</p>
                          </Card>
                          <Card className='bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6'>
                            <Target className='w-10 h-10 text-blue-600 mb-3' />
                            <h4 className='font-bold text-blue-900 mb-2'>Ofertas Smart</h4>
                            <p className='text-sm text-blue-700'>Promociones basadas en productos favoritos</p>
                          </Card>
                        </div>

                        <Button
                          size='lg'
                          className='w-full md:w-auto bg-gradient-to-r from-[#374bff] to-purple-600 hover:scale-105 transition-transform font-semibold px-8'
                          isDisabled
                        >
                          Activar Programa de Fidelidad
                        </Button>
                      </div>

                      {/* Preview Side */}
                      <div className='md:col-span-2'>
                        <Card className='bg-white shadow-2xl border-0 overflow-hidden'>
                          <div className='bg-gradient-to-r from-[#374bff] to-purple-600 p-6 text-white'>
                            <h4 className='font-bold text-lg'>Mi Programa de Puntos</h4>
                            <p className='text-blue-100 text-sm'>Restaurante El Buen Sabor</p>
                          </div>
                          <CardBody className='p-6'>
                            <div className='space-y-6'>
                              {/* Customer Level */}
                              <div>
                                <div className='flex justify-between items-center mb-2'>
                                  <span className='text-sm font-medium'>Nivel: Cliente Plata</span>
                                  <Chip size='sm' color='default' variant='flat'>
                                    15% descuento
                                  </Chip>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-2'>
                                  <div className='bg-gradient-to-r from-[#374bff] to-purple-600 h-2 rounded-full w-3/4'></div>
                                </div>
                                <p className='text-xs text-gray-500 mt-1'>750/1000 puntos para nivel Oro</p>
                              </div>

                              {/* Recent Activity */}
                              <div>
                                <h5 className='font-medium mb-3'>Actividad Reciente</h5>
                                <div className='space-y-3'>
                                  <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg'>
                                    <div>
                                      <p className='text-sm font-medium'>+50 puntos</p>
                                      <p className='text-xs text-gray-500'>Compra de $500</p>
                                    </div>
                                    <span className='text-xs text-gray-400'>Hoy</span>
                                  </div>
                                  <div className='flex justify-between items-center p-3 bg-purple-50 rounded-lg'>
                                    <div>
                                      <p className='text-sm font-medium'>Descuento usado</p>
                                      <p className='text-xs text-gray-500'>10% en hamburguesas</p>
                                    </div>
                                    <span className='text-xs text-gray-400'>Ayer</span>
                                  </div>
                                </div>
                              </div>

                              {/* Available Rewards */}
                              <div>
                                <h5 className='font-medium mb-3'>Recompensas Disponibles</h5>
                                <div className='space-y-2'>
                                  <div className='flex justify-between items-center p-2 border rounded-lg'>
                                    <span className='text-sm'>Bebida gratis</span>
                                    <span className='text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded'>
                                      100 pts
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center p-2 border rounded-lg'>
                                    <span className='text-sm'>20% descuento</span>
                                    <span className='text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded'>
                                      200 pts
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Tab>

              <Tab
                key='analytics'
                title={
                  <div className='flex items-center gap-2'>
                    <BarChart size={18} />
                    <span>Analytics Inteligentes</span>
                  </div>
                }
              >
                <Card className='mt-8 shadow-xl border-0 bg-white/80 backdrop-blur'>
                  <CardBody className='p-8 md:p-12'>
                    <div className='grid md:grid-cols-5 gap-12 items-start'>
                      {/* Content Side */}
                      <div className='md:col-span-3'>
                        <div className='flex items-center gap-3 mb-6'>
                          <div className='p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl'>
                            <BarChart size={24} className='text-white' />
                          </div>
                          <div>
                            <h3 className='text-2xl font-bold text-gray-900'>Analytics Inteligentes</h3>
                            <p className='text-gray-500'>Datos que impulsan decisiones</p>
                          </div>
                        </div>

                        <p className='text-lg text-gray-600 mb-8 leading-relaxed'>
                          Descubre patrones de compra, identifica tus productos estrella y conoce a tus mejores
                          clientes. Información clara y accionable para hacer crecer tu negocio estratégicamente.
                        </p>

                        {/* Analytics Features */}
                        <div className='space-y-4 mb-8'>
                          <div className='flex items-start gap-4'>
                            <div className='p-2 bg-blue-100 rounded-lg'>
                              <TrendingUp className='w-5 h-5 text-blue-600' />
                            </div>
                            <div>
                              <h4 className='font-semibold text-gray-900'>Productos Más Vendidos</h4>
                              <p className='text-gray-600 text-sm'>
                                Identifica tu inventario estrella y optimiza stock
                              </p>
                            </div>
                          </div>
                          <div className='flex items-start gap-4'>
                            <div className='p-2 bg-green-100 rounded-lg'>
                              <Users className='w-5 h-5 text-green-600' />
                            </div>
                            <div>
                              <h4 className='font-semibold text-gray-900'>Clientes Top</h4>
                              <p className='text-gray-600 text-sm'>Reconoce y premia a tus mejores compradores</p>
                            </div>
                          </div>
                          <div className='flex items-start gap-4'>
                            <div className='p-2 bg-purple-100 rounded-lg'>
                              <Clock className='w-5 h-5 text-purple-600' />
                            </div>
                            <div>
                              <h4 className='font-semibold text-gray-900'>Patrones de Horario</h4>
                              <p className='text-gray-600 text-sm'>Optimiza personal y promociones por horarios pico</p>
                            </div>
                          </div>
                          <div className='flex items-start gap-4'>
                            <div className='p-2 bg-orange-100 rounded-lg'>
                              <Target className='w-5 h-5 text-orange-600' />
                            </div>
                            <div>
                              <h4 className='font-semibold text-gray-900'>Efectividad de Promociones</h4>
                              <p className='text-gray-600 text-sm'>Mide ROI y ajusta estrategias en tiempo real</p>
                            </div>
                          </div>
                        </div>

                        <Button
                          size='lg'
                          className='w-full md:w-auto bg-gradient-to-r from-[#374bff] to-cyan-600 hover:scale-105 transition-transform font-semibold px-8'
                          isDisabled
                        >
                          Ver Dashboard Completo
                        </Button>
                      </div>

                      {/* Dashboard Preview */}
                      <div className='md:col-span-2'>
                        <Card className='bg-white shadow-2xl border-0'>
                          <div className='bg-gradient-to-r from-[#374bff] to-cyan-600 p-6 text-white'>
                            <h4 className='font-bold text-lg'>Dashboard Analytics</h4>
                            <p className='text-blue-100 text-sm'>Últimos 30 días</p>
                          </div>
                          <CardBody className='p-6'>
                            <div className='space-y-6'>
                              {/* KPIs */}
                              <div className='grid grid-cols-2 gap-4'>
                                <div className='text-center p-3 bg-green-50 rounded-lg'>
                                  <p className='text-2xl font-bold text-green-600'>+24%</p>
                                  <p className='text-xs text-gray-600'>Ventas vs mes anterior</p>
                                </div>
                                <div className='text-center p-3 bg-blue-50 rounded-lg'>
                                  <p className='text-2xl font-bold text-blue-600'>187</p>
                                  <p className='text-xs text-gray-600'>Clientes activos</p>
                                </div>
                              </div>

                              {/* Top Products */}
                              <div>
                                <h5 className='font-medium mb-3'>Top Productos</h5>
                                <div className='space-y-2'>
                                  {/*
                                    { name: 'Hamburguesa Clásica', sales: 156, trend: '+12%' },
                                    { name: 'Pizza Margherita', sales: 98, trend: '+8%' },
                                    { name: 'Papas Premium', sales: 87, trend: '+15%' }
                                  */}
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className='flex justify-between items-center p-2 bg-gray-50 rounded-lg'
                                    >
                                      <div>
                                        <p className='text-sm font-medium'>Producto {i + 1}</p>
                                        <p className='text-xs text-gray-500'>
                                          Ventas: {Math.floor(Math.random() * 100)}
                                        </p>
                                      </div>
                                      <span className='text-xs text-green-600 font-medium'>
                                        +{Math.floor(Math.random() * 20)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Sales Chart Preview */}
                              <div>
                                <h5 className='font-medium mb-3'>Ventas por Día</h5>
                                <div className='flex items-end h-20 gap-1'>
                                  {[40, 65, 45, 80, 90, 100, 75].map((height, i) => (
                                    <div
                                      key={i}
                                      className='flex-1 bg-gradient-to-t from-[#374bff] to-cyan-500 rounded-t opacity-80'
                                      style={{ height: `${height}%` }}
                                    />
                                  ))}
                                </div>
                                <div className='flex justify-between mt-2 text-xs text-gray-500'>
                                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                                    <span key={day}>{day}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          ) : (
            // SSR Placeholder
            <div className='border-b border-divider pb-4 mb-8 bg-white/50 backdrop-blur rounded-t-lg'>
              <div className='flex gap-8 p-6'>
                <div className='text-[#374bff] font-semibold flex items-center gap-2'>
                  <Heart size={18} />
                  Programa de Fidelidad
                </div>
                <div className='text-gray-500 flex items-center gap-2'>
                  <BarChart size={18} />
                  Analytics Inteligentes
                </div>
              </div>
            </div>
          )}

          {/* Default SSR Content */}
          {!isClient && (
            <Card className='mt-8 shadow-xl border-0 bg-white/80 backdrop-blur'>
              <CardBody className='p-8 md:p-12'>
                <div className='text-center'>
                  <div className='p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mx-auto mb-6'>
                    <Heart size={32} className='text-white' />
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-4'>Herramientas de Marketing Próximamente</h3>
                  <p className='text-gray-600 max-w-2xl mx-auto'>
                    Estamos desarrollando herramientas inteligentes para ayudarte a fidelizar clientes y analizar tu
                    negocio.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Bottom CTA */}
        <div className='text-center mt-16'>
          <Card className='bg-gradient-to-r from-[#374bff]/5 to-purple-600/5 border border-[#374bff]/20'>
            <CardBody className='p-8'>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>¿Quieres ser el primero en probarlo?</h3>
              <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
                Únete a nuestra lista de espera y obtén acceso anticipado a todas las herramientas de marketing, además
                de un descuento especial de lanzamiento.
              </p>
              <Button
                size='lg'
                variant='bordered'
                className='border-[#374bff] text-[#374bff] hover:bg-[#374bff] hover:text-white font-semibold px-8'
              >
                Unirme a la Lista de Espera
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  )
}
