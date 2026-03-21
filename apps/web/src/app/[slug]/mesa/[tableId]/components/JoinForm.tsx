'use client'

import { useState } from 'react'
import { Button, Input } from '@heroui/react'

interface JoinFormProps {
  onJoin: (name: string) => Promise<void>
  isLoading: boolean
  primaryColor?: string | null
}

export default function JoinForm({ onJoin, isLoading, primaryColor }: JoinFormProps) {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    if (name.trim()) onJoin(name.trim())
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#F9F7F4] px-6'>
      <div className='w-full max-w-xs flex flex-col gap-4'>
        <h1 className='text-xl font-semibold text-gray-900 text-center'>¿Cómo te llamas?</h1>
        <Input
          placeholder='Tu nombre'
          value={name}
          onValueChange={setName}
          variant='bordered'
          size='lg'
          classNames={{ inputWrapper: 'bg-white' }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <Button
          size='lg'
          radius='sm'
          className='w-full font-semibold'
          style={primaryColor ? { backgroundColor: primaryColor, color: '#fff' } : undefined}
          color={primaryColor ? undefined : 'primary'}
          onPress={handleSubmit}
          isLoading={isLoading}
          isDisabled={!name.trim()}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
