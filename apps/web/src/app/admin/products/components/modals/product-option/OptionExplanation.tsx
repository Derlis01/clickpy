import { Radio, RadioGroup } from "@heroui/react"

const OptionExplanation: React.FC = () => (
  <div className='text-center space-y-4 py-6 mt-8 opacity-90'>
    <div className='space-y-2'>
      <p className='text-gray-600 font-medium'>¿Qué son las opciones de producto?</p>
      <p className='text-gray-500 text-sm text-pretty'>
        Permite a los clientes elegir entre diferentes versiones de tu producto.
      </p>
    </div>

    <div className='border-2 border-[#DFDFDF] rounded-3xl bg-gray-100 pt-6 opacity-70 px-5'>
      <span className='text-black text-sm'>Talla</span>

      <div className='flex items-center pl-5 border-l-4 border-gray-500 mx-5 rounded-lg bg-white mb-5 mt-6 py-3'>
        <RadioGroup defaultValue={'1'}>
          <Radio value='1' color='secondary' className='opacity-65' />
        </RadioGroup>
        <div className='flex flex-col gap-1'>
          <span className='text-small'>Mediano</span>
          <span className='text-small pl-4'>Gs. 50.000</span>
        </div>
      </div>

      <div className='flex items-center pl-5 mx-5 rounded-lg bg-white mb-5 mt-6 py-3'>
        <RadioGroup>
          <Radio value='1' color='secondary' />
        </RadioGroup>
        <div className='flex flex-col gap-1'>
          <span className='text-small'>Grande</span>
          <span className='text-small pl-6'>Gs. 70.000</span>
        </div>
      </div>
    </div>
  </div>
)

export default OptionExplanation
