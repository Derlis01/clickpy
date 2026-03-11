import CardAdminContainer from '@/components/admin/CardAdminContainer'
import StatsReportDropdown from './tabs-page/StatsReportDropdown'
import { Tool } from 'react-feather'

export default function StatsReport() {
  return (
    <CardAdminContainer title='Reporte' optionalChildren={<StatsReportDropdown />}>
      <div className='flex items-center bg-yellow-50 p-4 rounded-xl'>
        <Tool size={30} className='text-yellow-600 mr-5' />
        <div>
          <p className='text-yellow-600 text-pretty'>¡Estamos trabajando en esta funcionalidad!</p>
          <p className='text-yellow-600 text-sm mt-1 text-pretty'>Pronto podrás disfrutar de esta nueva herramienta.</p>
        </div>
      </div>
    </CardAdminContainer>
  )
}
