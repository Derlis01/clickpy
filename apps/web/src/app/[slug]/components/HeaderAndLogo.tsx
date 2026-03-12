'use client'

import { Commerce } from '@/types/PublicCommerceDataResponse'
import { Image } from '@heroui/react'

interface HeaderAndLogoProps {
  commerceData: Commerce
}

export default function HeaderAndLogo({ commerceData }: HeaderAndLogoProps) {
  return (
    <div className='relative'>
      <div className='w-full'>
        <Image
          src={commerceData?.commerceBanner}
          alt='Commerce Banner'
          width='100%'
          radius='none'
          classNames={{
            img: 'w-full h-32 md:h-44 object-cover', // Aumentado de h-32 a h-44 en desktop
            wrapper: 'relative'
          }}
        />
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='max-w-2xl relative'>
          <Image
            src={commerceData?.commerceLogo}
            alt='Commerce Logo'
            radius='md'
            classNames={{
              img: 'bg-cover bg-center w-36 h-24 md:w-52 md:h-36 rounded-md object-cover border-white',
              wrapper: 'absolute bottom-[-40px] left-0 z-20'
            }}
          />
        </div>
      </div>
    </div>
  )
}
