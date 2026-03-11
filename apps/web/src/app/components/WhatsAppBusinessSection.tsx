'use client'

import { Card, CardBody } from '@heroui/react'
import { useState, useEffect, useRef } from 'react'
import { ShoppingBag, Search, Share2 } from 'react-feather'
import { motion, useInView } from 'framer-motion'
import QRIcon from '../../../public/qr-icon'

export default function WhatsAppBusinessSection() {
  const [isClient, setIsClient] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '150px', amount: 0.1 })

  useEffect(() => setIsClient(true), [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.4
      }
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 80, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.8
      }
    }
  }

  return (
    <section id='funcionalidades' className='py-16 md:py-24 bg-gradient-to-br from-purple-50 to-purple-100' ref={ref}>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Título */}
        <motion.div
          className='text-center mb-12'
          variants={titleVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Potencia tu WhatsApp</h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
            Clickpy no reemplaza tu WhatsApp, lo hace más eficiente para ti y más cómodo para tus clientes.
          </p>
        </motion.div>

        {/* Flex principal */}
        <motion.div
          className='flex flex-col gap-8'
          variants={containerVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Primera fila: Video (2) + Instagram (1) */}
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Video - 2 espacios */}
            <motion.div
              className='lg:flex-[2]'
              variants={cardVariants}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className='shadow-lg rounded-3xl overflow-hidden transition-shadow duration-300'>
                <div className='relative bg-[#f1f6ff] h-96 md:h-[450px]'>
                  {/* Vídeo en object-contain para mantener ratio y usar el fondo del contenedor */}
                  <video autoPlay loop muted playsInline className='w-full h-full' poster='/placeholder-catalog.jpg'>
                    <source src='https://images.clickpy.app/beauti-landing.webm' type='video/webm' />
                  </video>

                  {/* Fondo sólido para el texto */}
                  <div className='absolute top-0 left-0 right-0 bg-[#f1f6ff] p-6'>
                    <div className='flex items-center space-x-3'>
                      <motion.div variants={iconVariants}>
                        <ShoppingBag size={24} className='text-gray-900' />
                      </motion.div>
                      <h3 className='text-xl font-bold text-gray-900'>Muestra tus productos con estilo</h3>
                    </div>
                  </div>

                  {/* Overlay superior con difuminado después del texto */}
                  <div className='absolute top-[75px] left-0 right-0 bg-gradient-to-b from-[#f1f6ff] to-transparent h-8'></div>

                  {/* Overlay inferior con difuminado hacia arriba (más pequeño) */}
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f1f6ff] from-[15px] via-[#f1f6ff]/70 to-transparent h-16'></div>
                </div>
              </Card>
            </motion.div>

            {/* Instagram - 1 espacio */}
            <motion.div
              className='lg:flex-[1] lg:max-w-sm'
              variants={cardVariants}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className='shadow-lg rounded-3xl overflow-hidden transition-shadow duration-300'>
                <div className='relative bg-white h-96 md:h-[450px]'>
                  {/* Título en la parte superior */}
                  <div className='absolute top-0 left-0 right-0 p-4 md:p-6 bg-white z-10'>
                    <div className='flex items-center space-x-3'>
                      <motion.div variants={iconVariants}>
                        <Share2 size={20} className='text-[#374bff]' />
                      </motion.div>
                      <h3 className='text-lg md:text-xl font-bold text-gray-900'>Tu Tienda en tu Bio de Instagram</h3>
                    </div>
                  </div>

                  {/* Imagen de Instagram en la parte inferior con altura fija */}
                  <motion.div
                    className='absolute bottom-0 left-0 right-0 h-64 md:h-80 flex items-end justify-center'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1.2, delay: 1.0 }}
                  >
                    <img
                      src='https://images.clickpy.app/instagram-landing.webp'
                      alt='Instagram Profile with Clickpy Link'
                      className='w-full h-full object-contain'
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Segunda fila: QR (1) + Google (2) */}
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* QR - 1 espacio */}
            <motion.div
              className='lg:flex-[1] lg:max-w-sm'
              variants={cardVariants}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className='shadow-lg rounded-3xl overflow-hidden transition-shadow duration-300'>
                <div className='relative bg-white h-72 md:h-80'>
                  {/* Título en la parte superior */}
                  <div className='absolute top-0 left-0 right-0 p-4 md:p-6 bg-white z-10'>
                    <div className='flex items-center space-x-3'>
                      <motion.div
                        className='w-7 h-7 md:w-6 md:h-6 rounded flex items-center justify-center'
                        variants={iconVariants}
                        transition={{ duration: 0.6 }}
                      >
                        <QRIcon color='#374bff' />
                      </motion.div>
                      <h3 className='text-lg md:text-xl font-bold text-gray-900'>Tu Tienda en un Código QR</h3>
                    </div>
                  </div>

                  {/* GIF QR centrado */}
                  <motion.div
                    className='absolute inset-0 flex items-center justify-center pt-16 md:pt-20'
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{
                      duration: 1.2,
                      delay: 1.5,
                      type: 'spring',
                      stiffness: 150,
                      damping: 18
                    }}
                  >
                    <img
                      src='https://images.clickpy.app/qr.gif'
                      alt='QR Code Animation'
                      className='w-32 h-32 md:w-40 md:h-40 object-contain'
                    />
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Google - 2 espacios */}
            <motion.div
              className='lg:flex-[2]'
              variants={cardVariants}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className='shadow-lg rounded-3xl overflow-hidden transition-shadow duration-300'>
                <div className='relative bg-white h-72 md:h-80'>
                  {/* Título en la parte superior */}
                  <div className='absolute top-0 left-0 right-0 p-4 md:p-6 bg-white z-10'>
                    <div className='flex items-center space-x-3'>
                      <motion.div variants={iconVariants}>
                        <Search size={24} className='text-[#374bff]' />
                      </motion.div>
                      <h3 className='text-lg md:text-xl font-bold text-gray-900'>Tu Tienda Visible en Google</h3>
                    </div>
                  </div>

                  {/* Mockup de Google Search Results */}
                  <motion.div
                    className='absolute inset-0 flex items-center justify-center pt-16 md:pt-20 px-4 md:px-6'
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 1.0, delay: 1.2 }}
                  >
                    <motion.div
                      className='w-full bg-gray-50 rounded-lg p-4 md:p-6 border shadow-sm'
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {/* Header de Google */}
                      <div className='flex items-center space-x-2 mb-3 md:mb-4 pb-2 md:pb-3 border-b border-gray-200'>
                        <div className='w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                          <Search size={10} className='text-white md:hidden' />
                          <Search size={12} className='text-white hidden md:block' />
                        </div>
                        <span className='text-xs md:text-sm text-gray-600'>Google</span>
                      </div>

                      <div className='space-y-2 md:space-y-3'>
                        <div>
                          <h3 className='text-base md:text-lg text-blue-600 hover:underline cursor-pointer font-medium text-pretty'>
                            Tu Tienda - Productos de Calidad
                          </h3>
                          <p className='text-xs text-green-700 mt-1'>https://clickpy.app/tu-tienda</p>
                        </div>
                        <p className='text-xs md:text-sm text-gray-700 leading-relaxed text-pretty'>
                          Descubre nuestra amplia selección de productos de calidad. Compra fácil y rápido a través de
                          WhatsApp. Envíos a todo el país. ¡Visita nuestro catálogo online!
                        </p>
                        <div className='flex items-center space-x-2 md:space-x-4 text-xs text-gray-500'>
                          <span>⭐⭐⭐⭐⭐ 4.8</span>
                          <span>• En stock</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
