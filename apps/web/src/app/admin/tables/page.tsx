'use client'

import { useEffect, useState } from 'react'
import { Button, Input, Skeleton } from '@heroui/react'
import { Plus } from 'react-feather'
import useTableStore from '@/store/tableStore'
import TableCard from './components/TableCard'
import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { toast } from 'sonner'

export default function TablesPage() {
  const { tables, isLoading, fetchTables, generateTables } = useTableStore()
  const [count, setCount] = useState('5')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const handleGenerate = async () => {
    const num = parseInt(count)
    if (!num || num < 1 || num > 50) {
      toast.error('Ingresa un numero entre 1 y 50')
      return
    }
    setIsGenerating(true)
    await generateTables(num)
    toast.success(`${num} mesas creadas`)
    setIsGenerating(false)
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <CardAdminContainer
        title='Mesas'
        description='Las mesas se generan automaticamente con numero secuencial'
        optionalChildren={
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              size='sm'
              variant='bordered'
              className='w-20'
              value={count}
              onValueChange={setCount}
              min={1}
              max={50}
            />
            <Button
              color='primary'
              size='sm'
              radius='sm'
              startContent={<Plus size={16} />}
              onPress={handleGenerate}
              isLoading={isGenerating}
            >
              Generar
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className='flex flex-col gap-2'>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className='h-14 rounded-lg' />
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 mb-4'>No tienes mesas creadas</p>
            <p className='text-gray-400 text-sm'>Ingresa la cantidad y presiona "Generar"</p>
          </div>
        ) : (
          <div>
            {tables.map(table => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        )}
      </CardAdminContainer>
    </div>
  )
}
