'use client'

import { Tabs, Tab } from "@heroui/react"
import { usePathname, useRouter } from 'next/navigation'
import { Home, ShoppingBag, Tag, Briefcase, Grid, Clipboard } from 'react-feather'

const tabs = [
  { key: '/admin', icon: <Home />, label: 'Home' },
  { key: '/admin/orders', icon: <Clipboard />, label: 'Pedidos' },
  { key: '/admin/products', icon: <ShoppingBag />, label: 'Productos' },
  { key: '/admin/tables', icon: <Grid />, label: 'Mesas' },
  { key: '/admin/marketing', icon: <Tag />, label: 'Marketing' },
  { key: '/admin/local', icon: <Briefcase />, label: 'Local' }
]

const NavigationMobile = () => {
  // Obtenemos la ruta actual
  const pathName = usePathname()
  // Obtenemos el router para poder cambiar de ruta
  const router = useRouter()

  // Ordenamos las rutas de más larga a más corta
  const sortedTabs = [...tabs].sort((a, b) => b.key.length - a.key.length)

  // Encuentra la clave de la pestaña que comienza con la ruta actual
  const selectedKey = sortedTabs.find(tab => pathName.startsWith(tab.key))?.key

  return (
    <div className='flex w-full flex-col bg-slate-50 shadow-up text-tiny'>
      <Tabs
        aria-label='Navigation'
        color='primary'
        variant='light'
        // La pestaña seleccionada es la que comienza con la ruta actual
        selectedKey={selectedKey}
        // Cuando se selecciona una pestaña, cambiamos a su ruta
        onSelectionChange={(key: any) => {
          router.push(key)
        }}
        classNames={{
          tabList: 'w-full relative rounded-none h-[70px] p-0 border-b border-divider justify-between px-2',
          cursor: `w-full bg-[#d7dafc]`,
          tab: 'h-14 px-2 w-1/5',
          tabContent: 'group-data-[selected=true]:text-[#374bff]'
        }}
      >
        {tabs.map(tab => (
          <Tab
            key={tab.key}
            title={
              <div className='flex flex-col items-center justify-center gap-1'>
                {tab.icon}
                <span className='text-tiny'>{tab.label}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  )
}

export default NavigationMobile
