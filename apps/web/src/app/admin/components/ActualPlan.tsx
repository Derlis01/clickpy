'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Button } from '@heroui/react'
import { useUserPlan } from '@/hooks/useUserPlan'

export default function ActualPlan() {
  const { currentPlan } = useUserPlan()

  let plan
  if (currentPlan === 'free') {
    plan = 'Gratis'
  } else if (currentPlan === 'entrepreneur') {
    plan = 'Emprendedor'
  } else if (currentPlan === 'enterprise') {
    plan = 'Enterprise'
  }

  const handleUpdateClick = () => {
    window.open('https://wa.me/595972885139', '_blank')
  }

  return (
    <CardAdminContainer title='Plan actual' optionalChildren={<span className='text-lg'>{plan}</span>}>
      <div className='flex flex-col gap-3 my-4-'>
        <div>
          <p className='text-gray-700 text-center text-sm text-pretty'>¿Listo para el siguiente nivel?</p>
        </div>

        <Button color='primary' fullWidth={true} radius='sm' onPress={handleUpdateClick}>
          <span className='text-white font-semibold'>Actualizar</span>
        </Button>
      </div>
    </CardAdminContainer>
  )
}
