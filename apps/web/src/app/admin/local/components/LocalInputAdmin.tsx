'use client'

import { ReactElement } from 'react'
import { Edit2, Briefcase, MapPin, Phone, Clock, Droplet, Globe, Instagram, Facebook } from 'react-feather'
import LocalInputModal from './modals/LocalInputModal'
import { useDisclosure } from '@heroui/react'
import useCommerceStore from '@/store/commerceStore'
import { useRouter } from 'next/navigation'
import { Schedule } from '@/types/commerceModel'

export enum InputType {
  CommerceName = 'commerceName',
  CommerceAddress = 'commerceAddress',
  CommercePhone = 'commercePhone',
  CommerceSchedule = 'commerceSchedule',
  CommercePrimaryColor = 'commercePrimaryColor',
  CommerceSlug = 'commerceSlug',
  CommerceInstagram = 'commerceInstagram',
  CommerceFacebook = 'commerceFacebook',
  CommerceBanner = 'commerceBanner',
  CommerceLogo = 'commerceLogo',
  CommerceTiktok = 'commerceTiktok',
  AskPaymentMethod = 'askPaymentMethod'
}

interface LocalInputAdminProps {
  inputType: string & InputType
}

interface IconMap {
  [key: string]: ReactElement
}

const iconMap: IconMap = {
  commerceName: <Briefcase color='#838383' size={27} />,
  commerceAddress: <MapPin color='#838383' size={27} />,
  commercePhone: <Phone color='#838383' size={27} />,
  commerceSchedule: <Clock color='#838383' size={27} />,
  commercePrimaryColor: <Droplet color='#838383' size={27} />,
  commerceSlug: <Globe color='#838383' size={27} />,
  commerceInstagram: <Instagram color='#838383' size={27} />,
  commerceFacebook: <Facebook color='#838383' size={27} />
}

const textMap = {
  commerceName: 'El nombre de tu local',
  commerceAddress: 'Dirección',
  commercePhone: 'Teléfono',
  commerceSchedule: 'Horario de atención',
  commercePrimaryColor: 'Color principal',
  commerceSlug: 'Sitio web',
  commerceInstagram: 'Instagram',
  commerceFacebook: 'Facebook',
  commerceBanner: 'Banner URL',
  commerceLogo: 'Logo URL',
  commerceTiktok: 'TikTok',
  askPaymentMethod: 'Ask Payment Method'
}

export default function LocalInputAdmin({ inputType }: LocalInputAdminProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const router = useRouter()

  const handleClick = () => {
    if (inputType === 'commerceSchedule') {
      router.push('/admin/local/horario')
    } else {
      onOpen()
    }
  }

  const formatSchedule = (schedule: Schedule) => {
    if (schedule.active) {
      const initDate = new Date(schedule.hours[0].initUtcDate)
      const endDate = new Date(schedule.hours[0].endUtcDate)

      const initTime = `${initDate.getUTCHours().toString().padStart(2, '0')}:${initDate.getUTCMinutes().toString().padStart(2, '0')}`
      const endTime = `${endDate.getUTCHours().toString().padStart(2, '0')}:${endDate.getUTCMinutes().toString().padStart(2, '0')}`

      return (
        <div className='flex justify-between gap-2'>
          <span className='text-base'>{schedule.day}</span>{' '}
          <span className='text-base'>
            {initTime} - {endTime}
          </span>
        </div>
      )
    } else {
      return (
        <div className='flex justify-between gap-2'>
          <span className='w-12 text-base'>{schedule.day}</span> <span className='text-base'>Cerrado</span>
        </div>
      )
    }
  }

  const actualInputValue = useCommerceStore(state => state[inputType])

  return (
    <>
      <div
        className='border border-t-1 border-b-1 border-l-0 border-r-0 py-5 border-gray-100 w-full hover:bg-gray-50 transition-colors md:px-4 md:rounded-lg cursor-pointer'
        onClick={handleClick}
      >
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-3 w-full mr-4'>
            <div className='md:bg-gray-100 md:p-2 md:rounded-lg'>{iconMap[inputType]}</div>
            <div className='ml-2 w-full'>
              <div className='text-sm text-gray-500 md:mb-1 hidden md:block'>{textMap[inputType]}</div>
              <div className='md:font-medium'>
                {Array.isArray(actualInputValue)
                  ? actualInputValue.map((schedule, index) => <div key={index}>{formatSchedule(schedule)}</div>)
                  : actualInputValue || textMap[inputType]}
              </div>
            </div>
          </div>
          <Edit2 color='#262626' className='mr-3 md:hover:scale-110 transition-transform' size={27} />
        </div>
      </div>
      <LocalInputModal isOpen={isOpen} onOpenChange={onOpenChange} inputType={inputType} />
    </>
  )
}
