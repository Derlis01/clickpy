'use client'

import LocalInputAdmin from './LocalInputAdmin'
import { Switch } from '@heroui/react'
import useCommerceStore from '@/store/commerceStore'
import DesktopImageSection from './DesktopImageSection'
import { InputType } from './LocalInputAdmin'

export default function DesktopLayout() {
  const askPaymentMethod = useCommerceStore(state => state.askPaymentMethod)
  const setAskPaymentMethod = useCommerceStore(state => state.setAskPaymentMethod)

  return (
    <div className='w-full flex flex-row gap-6 p-6'>
      {/* Columna izquierda - Imágenes y redes sociales */}
      <div className='w-1/3 flex flex-col gap-6'>
        <DesktopImageSection />
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-xl font-medium mb-6'>Redes sociales</h2>
          <LocalInputAdmin inputType={InputType.CommerceInstagram} />
          <LocalInputAdmin inputType={InputType.CommerceFacebook} />
        </div>
      </div>

      {/* Columna derecha - Información principal y configuraciones */}
      <div className='w-2/3 flex flex-col gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-xl font-medium mb-6'>Información del local</h2>
          <LocalInputAdmin inputType={InputType.CommerceName} />
          <LocalInputAdmin inputType={InputType.CommerceAddress} />
          <LocalInputAdmin inputType={InputType.CommercePhone} />
          <LocalInputAdmin inputType={InputType.CommercePrimaryColor} />
          {/* <LocalInputAdmin inputType={InputType.CommerceSlug} /> */}
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-xl font-medium mb-6'>Horario</h2>
          <LocalInputAdmin inputType={InputType.CommerceSchedule} />
        </div>
      </div>
    </div>
  )
}
