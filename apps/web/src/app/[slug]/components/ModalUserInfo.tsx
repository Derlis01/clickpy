'use client'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  NumberInput,
  Select,
  SelectItem
} from '@heroui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import usePublicCart from '@/store/publicCart'
import usePublicCommerceStore from '@/store/publicCommerce'
import { Customer } from '@/types/PublicCommerceDataResponse'
import { useState, useEffect } from 'react'
import { Phone, User } from 'react-feather'
import { parsePhoneNumber, isValidPhoneNumber, getCountryCallingCode } from 'libphonenumber-js'

// Updated schema with phone validation
const schema = z.object({
  customerName: z.string().min(1, 'El nombre es obligatorio'),
  customerPhone: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .refine(phone => {
      try {
        // Check if it's already in international format
        if (phone.startsWith('+')) {
          return isValidPhoneNumber(phone)
        }
        // Otherwise, assume it's a Paraguay number
        return isValidPhoneNumber(`+595${phone.replace(/^0/, '')}`, 'PY')
      } catch {
        return false
      }
    }, 'Ingresa un número de teléfono válido')
})

type FormData = z.infer<typeof schema>

interface ModalUserInfoProps {
  isOpen: boolean
  onClose: () => void
  userInfoCompleted: boolean
  setUserInfoCompleted: (value: boolean) => void
}

// Country flag mapping
const countryFlags: Record<string, string> = {
  PY: '🇵🇾',
  AR: '🇦🇷',
  BR: '🇧🇷',
  UY: '🇺🇾',
  CL: '🇨🇱',
  BO: '🇧🇴',
  US: '🇺🇸'
  // Add more countries as needed
}

// Extended country mapping with comprehensive list
const countries = [
  // Paraguay first (default)
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', callingCode: '+595' },

  // Alphabetical order
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', callingCode: '+54' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', callingCode: '+61' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', callingCode: '+43' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', callingCode: '+880' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', callingCode: '+32' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', callingCode: '+591' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', callingCode: '+55' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', callingCode: '+56' },
  { code: 'CN', name: 'China', flag: '🇨🇳', callingCode: '+86' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', callingCode: '+57' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', callingCode: '+506' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', callingCode: '+53' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', callingCode: '+420' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', callingCode: '+45' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', callingCode: '+1' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', callingCode: '+593' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', callingCode: '+20' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', callingCode: '+503' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', callingCode: '+358' },
  { code: 'FR', name: 'France', flag: '🇫🇷', callingCode: '+33' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', callingCode: '+49' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', callingCode: '+30' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', callingCode: '+502' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', callingCode: '+504' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', callingCode: '+36' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', callingCode: '+354' },
  { code: 'IN', name: 'India', flag: '🇮🇳', callingCode: '+91' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', callingCode: '+62' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', callingCode: '+353' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', callingCode: '+972' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', callingCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', callingCode: '+82' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', callingCode: '+52' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', callingCode: '+31' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', callingCode: '+64' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', callingCode: '+505' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', callingCode: '+47' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', callingCode: '+507' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', callingCode: '+51' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', callingCode: '+63' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', callingCode: '+48' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', callingCode: '+351' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', callingCode: '+40' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', callingCode: '+7' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', callingCode: '+966' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', callingCode: '+65' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', callingCode: '+421' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', callingCode: '+386' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', callingCode: '+27' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', callingCode: '+46' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', callingCode: '+41' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', callingCode: '+66' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', callingCode: '+90' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', callingCode: '+380' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', callingCode: '+971' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
  { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', callingCode: '+598' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', callingCode: '+58' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', callingCode: '+84' }
]

export default function ModalUserInfo({ isOpen, onClose, setUserInfoCompleted }: ModalUserInfoProps) {
  const setCommerceCustomer = usePublicCart(state => state.setCommerceCustomer)
  const commerceCustomer = usePublicCart(state => state.commerceCustomer)
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const isPrimaryColorLight = usePublicCommerceStore(state => state.isPrimaryColorLight)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [detectedCountry, setDetectedCountry] = useState<{ code: string; flag: string; callingCode: string }>({
    code: 'PY',
    flag: '🇵🇾',
    callingCode: '+595'
  })
  const [selectedCountry, setSelectedCountry] = useState<string>('PY')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      customerPhone: ''
    }
  })

  // Format display value (what user sees)
  const formatDisplayValue = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Don't limit digits - let libphonenumber handle validation
    // Format with space after 4 digits for better readability
    if (digits.length <= 4) {
      return digits
    } else {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`
    }
  }

  // Format phone number based on selected country
  const formatPhoneForCountry = (value: string, countryCode: string) => {
    try {
      const country = countries.find(c => c.code === countryCode)
      if (!country) return value

      // Remove all non-digits
      const digits = value.replace(/\D/g, '')

      // Apply basic formatting based on country
      if (countryCode === 'PY') {
        // Paraguay: 0981 234567
        if (digits.length <= 4) return digits
        return `${digits.slice(0, 4)} ${digits.slice(4)}`
      } else if (countryCode === 'US' || countryCode === 'CA') {
        // US/Canada: (555) 123-4567
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
      } else {
        // Default: space every 3-4 digits
        if (digits.length <= 4) return digits
        return `${digits.slice(0, 4)} ${digits.slice(4)}`
      }
    } catch {
      return value
    }
  }

  // Convert to international format using selected country
  const toInternationalFormat = (localPhone: string, countryCode: string) => {
    try {
      const country = countries.find(c => c.code === countryCode)
      if (!country) return localPhone

      const cleanPhone = localPhone.replace(/\D/g, '')

      // Remove country calling code if already present
      const callingCodeDigits = country.callingCode.replace('+', '')
      let phoneDigits = cleanPhone

      if (cleanPhone.startsWith(callingCodeDigits)) {
        phoneDigits = cleanPhone.slice(callingCodeDigits.length)
      }

      // Remove leading zero for most countries (except some exceptions)
      if (phoneDigits.startsWith('0') && countryCode !== 'IT') {
        phoneDigits = phoneDigits.slice(1)
      }

      return `${country.callingCode}${phoneDigits}`
    } catch {
      return localPhone
    }
  }

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
    // Reformat current phone number for new country
    if (phoneDisplay) {
      const reformatted = formatPhoneForCountry(phoneDisplay, countryCode)
      setPhoneDisplay(reformatted)
      const international = toInternationalFormat(reformatted, countryCode)
      setValue('customerPhone', international)
      // Force re-validation of the phone field with new format
      trigger('customerPhone')
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneForCountry(value, selectedCountry)
    setPhoneDisplay(formatted)

    // Convert to international format for storage
    const international = toInternationalFormat(formatted, selectedCountry)
    setValue('customerPhone', international)
    // Force re-validation when phone changes
    trigger('customerPhone')
  }

  // Detect country from phone number
  const detectCountryFromPhone = (phone: string) => {
    try {
      const international = toInternationalFormat(phone, selectedCountry)
      const parsed = parsePhoneNumber(international)

      if (parsed && parsed.country) {
        const countryCode = parsed.country
        const flag = countryFlags[countryCode] || '🌍'
        const callingCode = `+${getCountryCallingCode(countryCode)}`

        setDetectedCountry({
          code: countryCode,
          flag: flag,
          callingCode: callingCode
        })
      }
    } catch {
      // Default to Paraguay if detection fails
      setDetectedCountry({
        code: 'PY',
        flag: '🇵🇾',
        callingCode: '+595'
      })
    }
  }

  useEffect(() => {
    if (isOpen && commerceCustomer) {
      setShowConfirmation(true)
    }
  }, [isOpen, commerceCustomer])

  const handleUseExistingCustomer = () => {
    if (commerceCustomer) {
      setUserInfoCompleted(true)
      onClose()
    }
  }

  const handleNewCustomer = () => {
    setShowConfirmation(false)
  }

  const onSubmit = (data: FormData) => {
    const customer: Customer = {
      customerName: data.customerName,
      customerPhone: data.customerPhone // This will be in international format
    }

    setCommerceCustomer(customer)
    setUserInfoCompleted(true)
    onClose()
  }

  const textColor = isPrimaryColorLight ? '#000' : '#fff'

  if (showConfirmation && commerceCustomer) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='sm'
        classNames={{
          base: 'bg-[#F9F7F4]',
          header: 'border-b-[1px] bg-white',
          body: 'py-6',
          footer: 'border-t-[1px] bg-white'
        }}
      >
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>
            <h2 className='text-xl font-bold text-pretty'>¿Usamos tus datos guardados?</h2>
          </ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              <div className='bg-white rounded-xl p-4 border border-gray-100 space-y-4 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-gray-50 rounded-full'>
                    <User size={18} className='text-gray-600' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-500'>Nombre</p>
                    <p className='font-medium truncate'>{commerceCustomer.customerName}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-gray-50 rounded-full'>
                    <Phone size={18} className='text-gray-600' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-500'>Teléfono</p>
                    <p className='font-medium truncate'>{commerceCustomer.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className='flex gap-2'>
            <Button variant='bordered' onPress={handleNewCustomer} className='flex-1 text-gray-600' size='lg'>
              Otros datos
            </Button>
            <Button
              className='flex-1'
              size='lg'
              style={{
                backgroundColor: commerceData?.commercePrimaryColor || 'black',
                color: textColor
              }}
              onPress={handleUseExistingCustomer}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  const selectedCountryData = countries.find(c => c.code === selectedCountry) || countries[0]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='sm'
      classNames={{
        body: 'py-6',
        base: 'bg-[#F9F7F4]',
        header: 'border-b-[1px] bg-white',
        footer: 'border-t-[1px] bg-white'
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className='flex flex-col gap-1'>
            <h2 className='text-xl font-bold text-pretty'>¿Cómo te contactamos?</h2>
          </ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-6'>
              <Controller
                name='customerName'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='¿Cómo te llamas?'
                    placeholder='Tu nombre completo'
                    variant='bordered'
                    isInvalid={!!errors.customerName}
                    errorMessage={errors.customerName?.message}
                    classNames={{
                      label: 'text-black/90 font-medium'
                    }}
                  />
                )}
              />

              <div className='flex gap-3'>
                <Select
                  label='País'
                  placeholder='País'
                  variant='bordered'
                  selectedKeys={[selectedCountry]}
                  onSelectionChange={keys => {
                    const countryCode = Array.from(keys)[0] as string
                    if (countryCode) handleCountryChange(countryCode)
                  }}
                  classNames={{
                    label: 'text-black/90 font-medium text-xs',
                    trigger: 'min-w-[100px] h-14',
                    base: 'w-17 flex-shrink-0',
                    value: 'text-xs'
                  }}
                  renderValue={items => {
                    return items.map(item => {
                      const country = countries.find(c => c.code === item.key)
                      return (
                        <div key={item.key} className='flex items-center gap-1'>
                          <span className='text-base'>{country?.flag}</span>
                          <span className='text-xs hidden sm:inline'>{country?.callingCode}</span>
                        </div>
                      )
                    })
                  }}
                >
                  {countries.map(country => (
                    <SelectItem key={country.code} textValue={`${country.name} ${country.callingCode}`}>
                      <div className='flex items-center gap-3'>
                        <span className='text-lg flex-shrink-0'>{country.flag}</span>
                        <div className='flex flex-col min-w-0 flex-1'>
                          <span className='text-sm font-medium truncate'>{country.name}</span>
                          <span className='text-xs text-gray-500'>{country.callingCode}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type='tel'
                  label='Tu número'
                  placeholder={
                    selectedCountry === 'PY'
                      ? '0981 234567'
                      : selectedCountry === 'US'
                        ? '(555) 123-4567'
                        : '123 456 789'
                  }
                  variant='bordered'
                  value={phoneDisplay}
                  onValueChange={handlePhoneChange}
                  isInvalid={!!errors.customerPhone}
                  errorMessage={errors.customerPhone?.message}
                  classNames={{
                    label: 'text-black/90 font-medium',
                    base: 'flex-1'
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose} className='flex-1'>
              cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1'
              style={{
                backgroundColor: commerceData?.commercePrimaryColor || 'black',
                color: textColor
              }}
            >
              Listo, continuar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
