'use client'

import { Card, CardBody, Button, Accordion, AccordionItem } from '@heroui/react'
import WhatsappLogo from '../../../public/whatsapp-logo'
import Link from 'next/link'

export default function FAQSection() {
  const faqs = [
    {
      question: '¿Qué es Clickpy?',
      answer:
        'Clickpy es una herramienta que te ayuda a crear tu catálogo digital y vender online de forma simple. Tus clientes pueden ver tus productos, hacer pedidos y enviártelos directamente por WhatsApp, todo sin complicaciones.'
    },
    {
      question: '¿Cómo llegan los pedidos a mi negocio?',
      answer:
        'Muy fácil: tu cliente elige productos de tu catálogo, completa sus datos y el pedido llega automáticamente a tu WhatsApp con toda la información organizada. Desde ahí coordinas la entrega y el pago como siempre.'
    },
    {
      question: '¿Hay límite de productos que puedo mostrar?',
      answer:
        'En el plan Gratuito puedes agregar hasta 10 productos, perfecto para comenzar. Con el Plan Emprendedor no hay límites: agrega todos los productos que quieras.'
    },
    {
      question: '¿Necesito instalar alguna aplicación?',
      answer:
        'Para nada. Todo funciona desde tu navegador web. Configuras tu catálogo desde cualquier dispositivo y tus clientes pueden comprar desde sus teléfonos sin descargar nada.'
    },
    {
      question: '¿Puedo cambiar o cancelar mi plan cuando quiera?',
      answer:
        'Absolutamente. No hay permanencia mínima ni contratos largos. Puedes cambiar de plan, pausar o cancelar cuando lo necesites desde tu panel de control.'
    },
    {
      question: '¿Tienes más preguntas?',
      answer:
        'Estamos aquí para ayudarte. Envíanos un mensaje por WhatsApp y te respondemos rápidamente. Nuestro equipo está disponible para resolver cualquier duda.'
    }
  ]

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/595972885139', '_blank')
  }

  return (
    <section id='preguntas' className='py-16 md:py-24 bg-white'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            Preguntas <span className='text-[#374bff]'>Frecuentes</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Resolvemos las dudas más comunes para que puedas empezar sin problemas
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion variant='splitted' defaultExpandedKeys={['0']} className='gap-4'>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index.toString()}
              aria-label={faq.question}
              title={<h3 className='text-lg font-semibold text-gray-900'>{faq.question}</h3>}
              className='border border-gray-200 shadow-sm'
            >
              <div className='pb-4'>
                <p className='text-gray-600 leading-relaxed mb-4'>{faq.answer}</p>

                {/* Special CTA for last FAQ */}
                {index === faqs.length - 1 && (
                  <Button
                    className='bg-green-500 hover:bg-green-600 text-white font-semibold'
                    startContent={<WhatsappLogo />}
                    onPress={handleWhatsAppClick}
                  >
                    Contactar por WhatsApp
                  </Button>
                )}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
