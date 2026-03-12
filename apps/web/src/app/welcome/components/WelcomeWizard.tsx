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
    organizationName: '',
    organizationSlug: '',
    organizationCategory: '',
    organizationWhatsapp: ''
  })

  const [errors, setErrors] = useState({
    organizationName: '',
    organizationSlug: '',
    organizationCategory: '',
    organizationWhatsapp: ''
  })

  const totalSteps = 3

  const validateStep1 = (): boolean => {
    const newErrors = { ...errors }
    let valid = true

    if (formData.organizationName.length < 3) {
      newErrors.organizationName = formData.organizationName.length === 0
        ? 'El nombre del comercio es requerido'
        : 'Ingrese un nombre válido (mínimo 3 caracteres)'
      valid = false
    } else {
      newErrors.organizationName = ''
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (formData.organizationSlug.length < 3 || !slugRegex.test(formData.organizationSlug)) {
      newErrors.organizationSlug = formData.organizationSlug.length === 0
        ? 'La URL del comercio es requerida'
        : 'Solo letras minúsculas, números y guiones'
      valid = false
    } else {
      newErrors.organizationSlug = ''
    }

    setErrors(newErrors)
    return valid
  }

  const validateStep2 = (): boolean => {
    if (!formData.organizationCategory) {
      setErrors(prev => ({ ...prev, organizationCategory: 'Seleccione una categoría' }))
      return false
    }
    setErrors(prev => ({ ...prev, organizationCategory: '' }))
    return true
  }

  const validateStep3 = (): boolean => {
    if (!isValidPhoneNumber || !formData.organizationWhatsapp) {
      setErrors(prev => ({ ...prev, organizationWhatsapp: 'Ingrese un número de WhatsApp válido' }))
      return false
    }
    setErrors(prev => ({ ...prev, organizationWhatsapp: '' }))
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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Sesión expirada. Iniciá sesión de nuevo.', { duration: 3000 })
        return
      }

      const formattedPhone = formData.organizationWhatsapp.replace(/\D/g, '')

      // 1. Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organizationName,
          slug: formData.organizationSlug,
          category: formData.organizationCategory,
          phone: formattedPhone,
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') {
          toast.error('Ese link ya está en uso. Elegí otro.', { duration: 3000 })
        } else {
          toast.error('Error al crear el comercio. Intente de nuevo.', { duration: 3000 })
        }
        return
      }

      // 2. Create organization member (owner)
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          profile_id: user.id,
          role: 'owner',
        })

      if (memberError) {
        toast.error('Error al configurar el acceso.', { duration: 3000 })
        return
      }

      // 3. Create main branch
      const { error: branchError } = await supabase
        .from('branches')
        .insert({
          organization_id: org.id,
          name: formData.organizationName,
          phone: formattedPhone,
          is_main: true,
        })

      if (branchError) {
        toast.error('Error al crear la sucursal.', { duration: 3000 })
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

  const handleNameChange = (value: string) => {
    const slug = generateSlug(value)
    setFormData(prev => ({ ...prev, organizationName: value, organizationSlug: slug }))
    if (errors.organizationName) setErrors(prev => ({ ...prev, organizationName: '' }))
  }

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({ ...prev, organizationSlug: value }))
    if (errors.organizationSlug) setErrors(prev => ({ ...prev, organizationSlug: '' }))
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
                value={formData.organizationName}
                onChange={e => handleNameChange(e.target.value)}
                isInvalid={!!errors.organizationName}
                errorMessage={errors.organizationName}
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
                value={formData.organizationSlug}
                startContent={
                  <div className='pointer-events-none flex items-center'>
                    <span className='text-default-400 text-small'>clickpy.app/</span>
                  </div>
                }
                onChange={e => handleSlugChange(e.target.value)}
                isInvalid={!!errors.organizationSlug}
                errorMessage={errors.organizationSlug}
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
                defaultOption={formData.organizationCategory}
                setSelectedKeys={(value: string) => {
                  setFormData(prev => ({ ...prev, organizationCategory: value }))
                  if (errors.organizationCategory) setErrors(prev => ({ ...prev, organizationCategory: '' }))
                }}
              />
              {errors.organizationCategory && (
                <span className='text-xs text-red-500'>{errors.organizationCategory}</span>
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
                  setFormData(prev => ({ ...prev, organizationWhatsapp: value }))
                  if (errors.organizationWhatsapp) setErrors(prev => ({ ...prev, organizationWhatsapp: '' }))
                }}
                setIsValidPhoneNumber={setIsValidPhoneNumber}
              />
              {errors.organizationWhatsapp && (
                <span className='text-xs text-red-500'>{errors.organizationWhatsapp}</span>
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
