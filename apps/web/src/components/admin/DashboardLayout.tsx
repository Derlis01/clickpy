'use client'

import { useWindowSize } from '@/hooks/useWindowSize'
import NavigationMobile from './navigation-mobile/NavigationMobile'
import AdminTabs from '@/components/admin/tabs-page/AdminTabs'
import { Home, ShoppingBag, Tag, Briefcase } from 'react-feather'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HeaderAdminClient from './header/HeaderAdminClient'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Productos', href: '/admin/products', icon: ShoppingBag },
  { name: 'Marketing', href: '/admin/marketing', icon: Tag },
  { name: 'Local', href: '/admin/local', icon: Briefcase }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isDesktop = useWindowSize()
  const pathname = usePathname()

  // Función mejorada para verificar si una ruta está activa
  const isRouteActive = (href: string) => {
    if (href === '/admin') {
      // Para el Home, solo debe estar activo en la ruta exacta
      return pathname === '/admin'
    }
    // Para las demás rutas, verificar si la ruta actual comienza con el href
    return pathname.startsWith(href)
  }

  // Usar un estado de carga inicial
  if (isDesktop === null) {
    return <div className='min-h-screen bg-gray-50' />
  }

  if (!isDesktop) {
    return (
      <section className='min-h-screen'>
        <HeaderAdminClient />
        <AdminTabs />
        <div className='overflow-auto mb-20'>{children}</div>
        <div className='fixed bottom-0 w-full z-50'>
          <NavigationMobile />
        </div>
      </section>
    )
  }

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r border-gray-200 fixed h-full'>
        <div className='flex flex-col h-full'>
          <div className='h-[70px] flex items-center px-6 bg-[#374bff]'>
            <span className='text-xl font-semibold text-white'>Dashboard</span>
          </div>
          <nav className='flex-1 px-4 py-6 space-y-1'>
            {navigationItems.map(item => {
              const isActive = isRouteActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} className={`mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className='flex-1 bg-gray-50 ml-64'>
        <div className='sticky top-0 z-10'>
          <div className='bg-white border-b border-gray-200'>
            <HeaderAdminClient />
          </div>
          <div className='bg-white border-b border-gray-200 px-8'>
            <AdminTabs />
          </div>
        </div>
        <div className='py-6 px-8'>{children}</div>
      </main>
    </div>
  )
}
