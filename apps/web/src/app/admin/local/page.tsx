'use client'

import useCommerceStore from '@/store/commerceStore'
import LocalBannerAdmin from './components/LocalBannerAdmin'
import LocalInputAdmin from './components/LocalInputAdmin'
import LocalLogoAdmin from './components/LocalLogoAdmin'
import { initialCommerceSchedule } from '@/constants/admin/businessSchedule'
import { useEffect } from 'react'
import { Skeleton } from '@heroui/react'
import DesktopLayout from './components/DesktopLayout'

enum InputType {
  CommerceName = 'commerceName',
  CommerceAddress = 'commerceAddress',
  CommercePhone = 'commercePhone',
  CommerceSchedule = 'commerceSchedule',
  CommercePrimaryColor = 'commercePrimaryColor',
  CommerceSlug = 'commerceSlug',
  CommerceInstagram = 'commerceInstagram',
  CommerceFacebook = 'commerceFacebook'
}

const Loading = () => {
  return (
    <div className='w-full flex flex-col items-center px-4 pt-3'>
      <Skeleton className='w-full rounded-md h-[100px]' />
      <div className='relative w-full h-[100px] px-5'>
        <Skeleton className='rounded-2xl w-[110px] h-[85px] absolute top-[-30px]' />
      </div>
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
    </div>
  )
}

export default function Home() {
  const commerceSchedule = useCommerceStore(state => state.commerceSchedule)
  const setCommerceSchedule = useCommerceStore(state => state.setCommerceSchedule)
  const isLoading = useCommerceStore(state => state.isLoading)

  useEffect(() => {
    if (commerceSchedule.length === 0) {
      setCommerceSchedule(initialCommerceSchedule)
    }
  }, [commerceSchedule, setCommerceSchedule])

  return (
    <div className='w-full flex justify-center'>
      <div className='w-full max-w-[1400px]'>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* Mobile Layout */}
            <div className='md:hidden'>
              <div className='w-full flex flex-col items-center relative pb-16'>
                <div className='relative w-full'>
                  <LocalBannerAdmin />
                  <div className='absolute bottom-36'>
                    <LocalLogoAdmin />
                  </div>
                </div>
                <div className='mt-16 w-full px-6'>
                  <LocalInputAdmin inputType={InputType.CommerceName} />
                  <LocalInputAdmin inputType={InputType.CommerceAddress} />
                  <LocalInputAdmin inputType={InputType.CommercePhone} />
                  <LocalInputAdmin inputType={InputType.CommerceSchedule} />
                  <LocalInputAdmin inputType={InputType.CommercePrimaryColor} />
                  {/* <LocalInputAdmin inputType={InputType.CommerceSlug} /> */}
                  <LocalInputAdmin inputType={InputType.CommerceInstagram} />
                  <LocalInputAdmin inputType={InputType.CommerceFacebook} />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className='hidden md:block'>
              <DesktopLayout />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
