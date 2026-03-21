'use client'

import { Tabs, Tab } from '@heroui/react'
import { useRouter, usePathname } from 'next/navigation'

// Define los títulos de las pestañas para cada ruta
const tabTitles: Record<string, string[]> = {
  '/admin': ['General'],
  '/admin/products': ['Productos'],
  '/admin/orders': ['General', 'Historial'],
  '/admin/orders/history': ['General', 'Historial'],
  '/admin/marketing': ['Inicio', 'Analisis', 'ia'],
  '/admin/marketing/analisis': ['Inicio', 'Analisis', 'ia'],
  '/admin/marketing/ia': ['Inicio', 'Analisis', 'ia'],
  '/admin/local': ['General', 'Horario', 'Carrito'],
  '/admin/local/horario': ['General', 'Horario', 'Carrito'],
  '/admin/local/carrito': ['General', 'Horario', 'Carrito']
}

const generateTabKey = (pathParts: string[], title: string, index: number) => {
  return index === 0
    ? `/${pathParts[1]}${pathParts[2] ? `/${pathParts[2]}` : ''}`
    : `/${pathParts[1]}/${pathParts[2] ? pathParts[2] : ''}/${title.toLowerCase()}`
}

const AdminTabs = () => {
  const router = useRouter()
  const pathName = usePathname()

  // Divide el pathName en sus partes
  const pathParts = pathName.split('/')

  // Obtiene los títulos de las pestañas para la ruta actual, o usa ['General'] si no hay títulos definidos
  const tabs = tabTitles[`/${pathParts[1]}/${pathParts[2]}`] || tabTitles[`/${pathParts[1]}`]

  return (
    <div className='my-2 md:my-0 md:py-1'>
      <Tabs
        aria-label='Tabs'
        variant='underlined'
        selectedKey={pathName}
        classNames={{
          tabList: 'px-4 gap-4',
          cursor: `w-full bg-[#151515] h-[2px]`,
          tab: 'h-9',
          tabContent:
            'group-data-[selected=true]:text-[#151515] group-data-[selected=true]:font-semibold text-gray-400 text-base'
        }}
        onSelectionChange={(key: any) => {
          router.push(key)
        }}
      >
        {/* Mapea cada título a un componente Tab. La clave es la parte relevante de la ruta más el título en minúsculas */}
        {tabs && tabs.map((title, index) => <Tab title={title} key={generateTabKey(pathParts, title, index)} />)}
      </Tabs>
    </div>
  )
}
export default AdminTabs
