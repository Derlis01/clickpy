'use client'

import LocalBannerAdmin from './LocalBannerAdmin'
import LocalLogoAdmin from './LocalLogoAdmin'

export default function DesktopImageSection() {
  return (
    <div className='bg-white rounded-xl p-6 pb-16 shadow-sm'>
      <h2 className='text-xl font-medium mb-6'>Imagenes del local</h2>
      <div className='relative'>
        <LocalBannerAdmin />
        <div className='absolute bottom-36 z-10'>
          <LocalLogoAdmin />
        </div>
      </div>
    </div>
  )
}
