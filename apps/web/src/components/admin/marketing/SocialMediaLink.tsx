'use client'

import { Button, Input, Tooltip, Accordion, AccordionItem } from '@heroui/react'
import { Copy, Instagram, Share2, ExternalLink, Code, ArrowDownLeft, ArrowRight } from 'react-feather'
import useCommerceStore from '@/store/commerceStore'
import { useState } from 'react'
import WhatsappLogo from '../../../../public/whatsapp-logo'
import Link from 'next/link'
import QRIcon from '../../../../public/qr-icon'

const SocialMediaLink = () => {
  const commerceSlug = useCommerceStore(state => state.commerceSlug)
  const [copied, setCopied] = useState(false)

  const businessUrl = typeof window !== 'undefined' ? `${window.location.origin}/${commerceSlug}` : ''

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(businessUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* URL Input Section */}
      <div className='flex gap-2'>
        <Input
          value={businessUrl}
          readOnly
          labelPlacement='outside'
          startContent={<ExternalLink size={18} className='text-gray-400' />}
          classNames={{
            input: 'bg-gray-50 font-medium'
          }}
        />
        <Tooltip content={copied ? '¡Copiado!' : 'Copiar enlace'}>
          <Button isIconOnly variant='flat' onPress={copyToClipboard} className='flex-shrink-0'>
            <Copy size={18} className={copied ? 'text-green-600' : ''} />
          </Button>
        </Tooltip>
      </div>

      <div className='flex flex-col gap-4'>
        {/* Accordion para "Cómo usar" */}
        <Accordion className='px-0' variant='light'>
          <AccordionItem key='1' aria-label='¿Dónde usar?' title='¿Dónde usar?' className='px-0'>
            <div className='flex flex-col gap-4 p-2'>
              {/* WhatsApp Card */}
              <div className='flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 flex-1'>
                <div className='p-2 bg-green-50 rounded-lg'>
                  <WhatsappLogo size={20} />
                </div>
                <div>
                  <p className='font-medium mb-1'>Info de WhatsApp</p>
                  <p className='text-sm text-gray-600'>Agrega el link en la información de tu perfil de WhatsApp.</p>
                </div>
              </div>

              {/* Instagram Card */}
              <div className='flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 flex-1'>
                <div className='p-2 bg-pink-50 rounded-lg'>
                  <Instagram size={20} className='text-pink-600' />
                </div>
                <div>
                  <p className='font-medium mb-1'>Bio de Instagram</p>
                  <p className='text-sm text-gray-600'>
                    Coloca el link en tu biografía para que tus seguidores puedan acceder directamente.
                  </p>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* QR Info Link - Versión Sutil */}
        <div className='flex justify-center border-t border-gray-100 mt-4 pt-4'>
          <Link
            href='/admin/marketing'
            className='group flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors'
          >
            <QRIcon size={25} />
            <span className='text-sm text-gray-600 group-hover:text-gray-800 transition-colors'>
              También preparamos tu QR
            </span>
            <ArrowRight size={16} className='text-gray-400 group-hover:text-gray-600 transition-colors' />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SocialMediaLink
