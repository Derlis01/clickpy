import { Checkbox } from "@heroui/react"

const OptionExplanation: React.FC = () => (
  <div className='text-center space-y-4 py-6 mt-2 opacity-90'>
    <div className='space-y-2'>
      <p className='text-gray-600 font-medium'>¿Qué son los adicionales de un producto?</p>
      <p className='text-gray-500 text-sm text-pretty'>
        Los adicionales son extras que el cliente puede añadir a su producto.
      </p>
    </div>

    <div className='border-2 border-[#DFDFDF] rounded-3xl bg-gray-100 pt-6 opacity-70 px-5'>
      <span className='text-black text-sm'>Adicionales</span>

      <div className='flex items-center pl-5 border-l-4 border-gray-500 mx-5 rounded-lg bg-white mb-5 mt-6 py-3'>
        <Checkbox color='secondary' defaultSelected={true} className='opacity-65' />
        <div className='flex flex-col gap-1'>
          <span className='text-small'>Extra queso</span>
          <span className='text-small pl-4'>+ Gs. 5.000</span>
        </div>
      </div>

      <div className='flex items-center pl-5 mx-5 rounded-lg bg-white mb-5 mt-6 py-3'>
        <Checkbox color='secondary' />
        <div className='flex flex-col gap-1'>
          <span className='text-small'>Extra Panceta</span>
          <span className='text-small pl-6'>+ Gs. 7.000</span>
        </div>
      </div>
    </div>
  </div>
)

export default OptionExplanation
