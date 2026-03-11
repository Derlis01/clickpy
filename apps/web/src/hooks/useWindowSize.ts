import { useState, useEffect } from 'react'

export const useWindowSize = () => {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    function checkSize() {
      setIsDesktop(window.innerWidth >= 768)
    }

    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      checkSize()
      window.addEventListener('resize', checkSize)
      return () => window.removeEventListener('resize', checkSize)
    }
  }, [])

  // Durante SSR o hidratación inicial, retornar null
  if (typeof window === 'undefined') {
    return null
  }

  return isDesktop
}
