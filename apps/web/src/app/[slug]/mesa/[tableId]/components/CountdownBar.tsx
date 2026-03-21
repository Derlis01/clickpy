'use client'

import { useState, useEffect } from 'react'

interface CountdownBarProps {
  endsAt: string
}

export default function CountdownBar({ endsAt }: CountdownBarProps) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  const minutes = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 text-center'>
      <p className='text-amber-800 text-2xl font-bold'>
        {minutes}:{secs.toString().padStart(2, '0')}
      </p>
      <p className='text-amber-700 text-xs mt-1.5 leading-relaxed'>
        Esperando a que todos confirmen. Si el tiempo se acaba, se envia sin los que falten.
      </p>
    </div>
  )
}
