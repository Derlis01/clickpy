'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardBody, Input, Progress } from '@heroui/react'
import ReusableDropdown from '@/components/public/Dropdown'
import PhoneNumberInput from '@/components/InputPhoneNumber'
import { commerceCategories } from '@/constants/commerceCategories'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

export default function WelcomeWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false)

  const [formData, setFormData] = useState({
    commerceName: '',
    commerceSlug: '',
    commerceCategory: '',
    commerceWhatsapp: ''
  })

  const [errors, setErrors] = useState({
    commerceName: '',
    commerceSlug: '',
    commerceCategory: '',
    commerceWhatsapp: ''
  })

  const totalSteps = 3

  const validateStep1 = (): boolean => {
    const newErrors = { ...errors }
    let valid = true

    if (formData.commerceName.length < 3) {
      newErrors.commerceName = formData.commerceName.length === 0
        ? 'El nombre del comercio es requerido'
        : 'Ingrese un nombre válido (mínimo 3 caracteres)'
      valid = false
    } else {
      newErrors.commerceName = ''
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (formData.commerceSlug.length < 3 || !slugRegex.test(formData.commerceSlug)) {
      newErrors.commerceSlug = formData.commerceSlug.length === 0
        ? 'La URL del comercio es requerida'
        : 'Solo letras minúsculas, números y guiones'
      valid = false
    } else {
      newErrors.commerceSlug = ''
    }

    setErrors(newErrors)
    return valid
  }

  const validateStep2 = (): boolean => {
    if (!formData.commerceCategory) {
      setErrors(prev => ({ ...prev, commerceCategory: 'Seleccione una categoría' }))
      return false
    }
    setErrors(prev => ({ ...prev, commerceCategory: '' }))
    return true
  }

  const validateStep3 = (): boolean => {
    if (!isValidPhoneNumber || !formData.commerceWhatsapp) {
      setErrors(prev => ({ ...prev, commerceWhatsapp: 'Ingrese un número de WhatsApp válido' }))
      return false
    }
    setErrors(prev => ({ ...prev, commerceWhatsapp: '' }))
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    setLoading(true)

    try {
      const supabase = createClient()

      const formattedPhone = formData.commerceWhatsapp.replace(/\D/g, '')

      // Save commerce data in user_metadata so the DB trigger can create the commerce
      const { error } = await supabase.auth.updateUser({
        data: {
          commerce_name: formData.commerceName,
          commerce_slug: formData.commerceSlug,
          commerce_category: formData.commerceCategory,
          commerce_phone: formattedPhone
        }
      })

      if (error) {
        toast.error('Error al guardar los datos. Intente de nuevo.', { duration: 3000 })
        setLoading(false)
        return
      }

      toast.success('¡Comercio creado exitosamente!', { duration: 3000 })
      router.push('/admin')
    } catch {
      toast.error('Error inesperado. Intente de nuevo.', { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const handleCommerceNameChange = (value: string) => {
    const slug = generateSlug(value)
    setFormData(prev => ({ ...prev, commerceName: value, commerceSlug: slug }))
    if (errors.commerceName) setErrors(prev => ({ ...prev, commerceName: '' }))
  }

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({ ...prev, commerceSlug: value }))
    if (errors.commerceSlug) setErrors(prev => ({ ...prev, commerceSlug: '' }))
  }

  return (
    <Card className='w-full max-w-[500px] shadow-sm'>
      <CardBody className='p-8'>
        <div className='mb-8'>
          <h1 className='text-xl font-semibold mb-2'>Configurá tu comercio</h1>
          <p className='text-sm text-gray-500'>Paso {step} de {totalSteps}</p>
          <Progress
            value={(step / totalSteps) * 100}
            className='mt-3'
            size='sm'
            color='primary'
          />
        </div>

        {step === 1 && (
          <div className='flex flex-col gap-6'>
            <div>
              <span className='text-sm'>Nombre del comercio</span>
              <Input
                placeholder='Nombre de mi comercio'
                className='w-full mt-1'
                radius='sm'
                variant='bordered'
                size='md'
                value={formData.commerceName}
                onChange={e => handleCommerceNameChange(e.target.value)}
                isInvalid={!!errors.commerceName}
                errorMessage={errors.commerceName}
              />
            </div>

            <div>
              <span className='text-sm'>Link para el comercio</span>
              <Input
                placeholder='mi-negocio'
                className='w-full mt-1'
                radius='sm'
                variant='bordered'
                size='md'
                value={formData.commerceSlug}
                startContent={
                  <div className='pointer-events-none flex items-center'>
                    <span className='text-default-400 text-small'>clickpy.app/</span>
                  </div>
                }
                onChange={e => handleSlugChange(e.target.value)}
                isInvalid={!!errors.commerceSlug}
                errorMessage={errors.commerceSlug}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-1'>
              <span className='text-sm'>Rubro del comercio</span>
              <ReusableDropdown
                options={commerceCategories}
                defaultOption={formData.commerceCategory}
                setSelectedKeys={(value: string) => {
                  setFormData(prev => ({ ...prev, commerceCategory: value }))
                  if (errors.commerceCategory) setErrors(prev => ({ ...prev, commerceCategory: '' }))
                }}
              />
              {errors.commerceCategory && (
                <span className='text-xs text-red-500'>{errors.commerceCategory}</span>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='flex flex-col gap-6'>
            <div>
              <span className='text-sm'>WhatsApp donde se recibirán los pedidos</span>
              <PhoneNumberInput
                onPhoneNumberChange={(value: string) => {
                  setFormData(prev => ({ ...prev, commerceWhatsapp: value }))
                  if (errors.commerceWhatsapp) setErrors(prev => ({ ...prev, commerceWhatsapp: '' }))
                }}
                setIsValidPhoneNumber={setIsValidPhoneNumber}
              />
              {errors.commerceWhatsapp && (
                <span className='text-xs text-red-500'>{errors.commerceWhatsapp}</span>
              )}
            </div>
          </div>
        )}

        <div className='flex gap-3 mt-8'>
          {step > 1 && (
            <Button
              variant='light'
              className='font-medium'
              radius='sm'
              onPress={handleBack}
            >
              Atrás
            </Button>
          )}

          <Button
            isLoading={loading}
            className='w-full text-white font-medium'
            radius='sm'
            color='primary'
            onPress={step === totalSteps ? handleSubmit : handleNext}
          >
            {step === totalSteps ? 'Crear comercio' : 'Siguiente'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
