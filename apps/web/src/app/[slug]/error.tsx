'use client'

import { useEffect } from 'react'

export default function CommerceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-4 text-gray-500'>
      <p className='text-lg font-medium'>No se pudo cargar este comercio.</p>
      <button onClick={reset} className='text-sm text-blue-500 hover:underline'>
        Intentar de nuevo
      </button>
    </div>
  )
}
