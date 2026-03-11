'use client'

import { Button } from '@heroui/react'
import WhatsappLogo from '../../../public/whatsapp-logo'

interface WhatsAppFloatButtonProps {
  isVisible?: boolean
}

export default function WhatsAppFloatButton({ isVisible = true }: WhatsAppFloatButtonProps) {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/595972885139', '_blank')
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <Button
        isIconOnly
        size='lg'
        className='bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all'
        onPress={handleWhatsAppClick}
      >
        <WhatsappLogo />
      </Button>
    </div>
  )
}
