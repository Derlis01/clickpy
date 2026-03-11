'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import StatsReport from '@/components/admin/StatsReport'
import { Tool } from 'react-feather'

const AnalisisPage: React.FC = () => {
  return (
    <div className='flex flex-col gap-5 px-4 pt-5'>
      <CardAdminContainer title='Top clientes'>
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

      <CardAdminContainer title='Top productos'>
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

      <StatsReport />
    </div>
  )
}

export default AnalisisPage
