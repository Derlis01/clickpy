'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Divider
} from '@heroui/react'
import ClickpyLogo from '../../../public/logo-clickpy-white'
import WhatsappLogo from '../../../public/whatsapp-logo'
import WhatsAppFloatButton from './WhatsAppFloatButton'
import Link from 'next/link'

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const menuItems = [
    { name: 'Precios', href: '#precios' },
    { name: 'Preguntas Frecuentes', href: '#preguntas' },
    { name: 'Demo', href: 'https://clickpy.app/restaurante-de-prueba' }
  ]

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/595972885139', '_blank')
  }

  return (
    <>
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className='bg-white/95 backdrop-blur-sm sticky top-0 z-50'
      >
        <NavbarContent>
          <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className='md:hidden' />
          <NavbarBrand>
            <div className='flex items-center space-x-2'>
              <ClickpyLogo />
            </div>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className='hidden md:flex gap-4' justify='center'>
          <NavbarItem>
            <Link href='#precios' color='foreground' className='hover:text-[#374bff]'>
              Precios
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href='#preguntas' color='foreground' className='hover:text-[#374bff]'>
              Preguntas
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href='https://clickpy.app/restaurante-de-prueba'
              target='_blank'
              color='foreground'
              className='hover:text-[#374bff]'
            >
              Demo
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify='end'>
          <NavbarItem className='hidden md:flex'>
            <Button
              variant='bordered'
              color='primary'
              className='font-semibold mr-2'
              onPress={() => router.push('/login')}
            >
              Iniciar Sesión
            </Button>
          </NavbarItem>
          <NavbarItem className='hidden md:flex'>
            <Button color='primary' className='font-semibold' onPress={() => router.push('/register')}>
              Crear Tienda
            </Button>
          </NavbarItem>
          <NavbarItem className='md:hidden'>
            <Button color='primary' size='sm' className='font-semibold' onPress={() => router.push('/register')}>
              Crear Tienda
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className='pt-6 flex flex-col transition-all duration-100 ease-out'>
          <div>
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.name}-${index}`}>
                <Link
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  className='w-full text-lg font-medium text-gray-700 hover:text-[#374bff] py-3'
                  onClick={() => {
                    setIsMenuOpen(false)
                    if (!item.href.startsWith('http')) {
                      setTimeout(() => {
                        const element = document.querySelector(item.href)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      }, 100)
                    }
                  }}
                >
                  {item.name}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>

          <div>
            <Divider className='my-7' />
            <NavbarMenuItem>
              <div className='flex flex-col gap-3 w-full'>
                <Button
                  variant='bordered'
                  color='primary'
                  className='w-full font-semibold'
                  onPress={() => {
                    setIsMenuOpen(false)
                    router.push('/login')
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold'
                  startContent={<WhatsappLogo />}
                  onPress={() => {
                    setIsMenuOpen(false)
                    handleWhatsAppClick()
                  }}
                >
                  Hablemos
                </Button>
              </div>
            </NavbarMenuItem>
          </div>
        </NavbarMenu>
      </Navbar>

      {/* WhatsApp Float Button - controlled by menu state */}
      <WhatsAppFloatButton isVisible={!isMenuOpen} />
    </>
  )
}
