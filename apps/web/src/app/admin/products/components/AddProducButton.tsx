'use client'

import { Plus } from 'react-feather'
import AddProductModal from './modals/AddProductModal'
import { Button, Divider } from '@heroui/react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AddProductButton() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleOpenModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('addProduct', 'true')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div className='flex md:justify-end items-center mb-8'>
        <div
          className='flex items-center gap-4 px-2 mt-4 md:hidden'
          onClick={handleOpenModal}
        >
          <div className='bg-gray-200 p-5 rounded-lg'>
            <Plus color='#979797' size={30} />
          </div>
          <div>
            <p className='text-gray-900 font-medium'>Agregar nuevo producto</p>
          </div>
        </div>

        <Button
          className='hidden md:flex shadow-sm'
          color='primary'
          startContent={<Plus size={20} />}
          onClick={handleOpenModal}
        >
          Agregar producto
        </Button>
      </div>
      <AddProductModal
        isOpen={searchParams.get('addProduct') === 'true'}
        onOpenChange={open => {
          if (!open) {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('addProduct')
            router.push(`?${params.toString()}`, { scroll: false })
          }
        }}
      />
      <Divider className='my-5' />
    </>
  )
}
