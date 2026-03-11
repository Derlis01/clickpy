'use client'
import { useDisclosure } from "@heroui/react"
import AddProductModal from './modals/AddProductModal'
import { Button } from "@heroui/react"
import { Plus } from 'react-feather'
import BagShoppingIllustration from '../../../../../public/bag-shopping-illustration'

export default function ProductEmptyState() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <div className='flex items-center justify-center gap-5 mx-4 bg-[#FAFAFA] border-1 rounded-lg border-[#CDCDCD] px-3 py-5'>
        <BagShoppingIllustration />
        <div>
          <div>
            <h2 className='font-semibold text-balance mb-1'>Publica tu primer producto</h2>
            <p className='text-sm text-gray-600 mb-4'>para comenzar a recibir pedidos.</p>
          </div>
          <Button color='secondary' fullWidth={true} radius='sm' onPress={onOpen} size='sm'>
            <div className='flex items-center gap-1'>
              <Plus />
              <span className='text-base'>Agregar</span>
            </div>
          </Button>
        </div>
      </div>
      <AddProductModal isOpen={isOpen} onOpenChange={onOpenChange} productToEdit={null} />
    </>
  )
}
