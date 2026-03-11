'use client'

import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  // Use transform instead of y property to prevent layout shift
  const itemVariants = {
    hidden: { opacity: 0, transform: 'translateY(20px)' },
    visible: {
      opacity: 1,
      transform: 'translateY(0px)',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const videoVariants = {
    hidden: { opacity: 0, transform: 'scale(0.98)' },
    visible: {
      opacity: 1,
      transform: 'scale(1)',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <section className='py-12 md:py-20 bg-gradient-to-br bg-[#ecf6ff]'>
      <div className='max-w-6xl mx-auto px-4'>
        <motion.div
          className='text-center mb-8'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          style={{ minHeight: '200px' }} // Reserve space to prevent shift
        >
          <motion.h1
            className='text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6'
            variants={itemVariants}
          >
            Crea Tu Tienda Online. <br />
            <span className='text-[#374bff]'>Cero Comisiones.</span>
          </motion.h1>
          <motion.p
            className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed'
            variants={itemVariants}
          >
            Tu catálogo online listo en minutos. Pedidos organizados, directo a tu WhatsApp.
          </motion.p>
        </motion.div>

        {/* Visual Principal */}
        <motion.div
          className='flex flex-col items-center justify-center mb-12'
          initial='hidden'
          animate='visible'
          variants={videoVariants}
        >
          {/* Video explicativo */}
          <div className='w-full max-w-2xl py-4'>
            <video
              className='w-full rounded-xl h-[450px]'
              autoPlay
              muted
              loop
              preload='metadata'
              playsInline
              style={{ display: 'block' }} // Ensure proper display
            >
              <source src='https://images.clickpy.app/landing.webm' type='video/webm' />
              <p className='text-center text-gray-600 p-6'>
                Tu navegador no soporta video HTML5.
                <a href='https://images.clickpy.app/landing.webm' className='text-[#374bff] underline ml-1'>
                  Descargar video
                </a>
              </p>
            </video>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className='flex flex-col sm:flex-row justify-center gap-4'
          initial={{ opacity: 0, transform: 'translateY(20px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <Button
              size='lg'
              variant='bordered'
              color='primary'
              className='px-8 py-6 text-lg font-semibold'
              onPress={() => window.open('https://clickpy.app/restaurante-de-prueba', '_blank')}
            >
              Ver Demo
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
            <Button
              size='lg'
              className='bg-[#374bff] hover:bg-[#374bff]/90 text-white px-8 py-6 text-lg font-semibold'
              onPress={() => router.push('/register')}
            >
              Crear Tienda
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
