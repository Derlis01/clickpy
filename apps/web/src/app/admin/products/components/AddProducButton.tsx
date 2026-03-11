'use client'

import { Plus, AlertTriangle } from 'react-feather'
import AddProductModal from './modals/AddProductModal'
import { Button, Divider, useDisclosure } from '@heroui/react'
import { useProductLimit } from '@/utils/planLimitations'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AddProductButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLimitReached } = useProductLimit()

  const handleOpenModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('addProduct', 'true')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      {isLimitReached && (
        <div className='flex flex-col items-center justify-center bg-yellow-100 text-yellow-800 p-4 mb-4 mx-[-12px]'>
          <div className='flex items-center'>
            <AlertTriangle className='mr-2' size={24} />
            <p className='text-pretty'>Llegaste al límite de productos de tu plan</p>
          </div>
          <a
            href='https://wa.me/595972885139'
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 text-warning-600 underline'
          >
            Actualizar Plan
          </a>
        </div>
      )}
      <div className='flex md:justify-end items-center mb-8'>
        <div
          className={`flex items-center gap-4 px-2 mt-4 md:hidden ${isLimitReached ? 'pointer-events-none opacity-50' : ''}`}
          onClick={!isLimitReached ? handleOpenModal : undefined}
        >
          <div className='bg-gray-200 p-5 rounded-lg'>
            <Plus color='#979797' size={30} />
          </div>
          <div>
            <p className='text-gray-900 font-medium'>Agregar nuevo producto</p>
          </div>
        </div>

        <Button
          className={`hidden md:flex shadow-sm ${isLimitReached ? 'pointer-events-none opacity-50' : ''}`}
          color='primary'
          startContent={<Plus size={20} />}
          onClick={!isLimitReached ? handleOpenModal : undefined}
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
