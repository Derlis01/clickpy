import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-4 text-gray-500'>
      <h1 className='text-6xl font-bold text-gray-200'>404</h1>
      <p className='text-lg font-medium'>Esta página no existe.</p>
      <Link href='/' className='text-sm text-blue-500 hover:underline'>
        Volver al inicio
      </Link>
    </div>
  )
}
