'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { ImageGeneration } from '@/components/admin/marketing/image-generation/ImageGeneration'
import QRCodeCard from '@/components/admin/marketing/QRCodeCard'
import SocialMediaLink from '@/components/admin/marketing/SocialMediaLink'
import { Tool } from 'react-feather'

export default function Home() {
  return (
    <div className='px-4 md:px-6 lg:px-8 mt-2'>
      <div className='flex flex-col lg:flex-row flex-wrap gap-4 md:gap-6'>
        <div>
          <ImageGeneration />
        </div>

        <div className='w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] self-start'>
          <QRCodeCard />
        </div>

        <div className='w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] self-start'>
          <CardAdminContainer title='Tip del dia'>
            <div className='flex items-center bg-yellow-50 p-4 rounded-xl'>
              <Tool size={30} className='text-yellow-600 mr-5' />
              <div>
                <p className='text-yellow-600 text-pretty'>¡Estamos trabajando en esta funcionalidad!</p>
                <p className='text-yellow-600 text-sm mt-1 text-pretty'>
                  Pronto podrás disfrutar de esta nueva herramienta.
                </p>
              </div>
            </div>
          </CardAdminContainer>
        </div>
      </div>
    </div>
  )
}
