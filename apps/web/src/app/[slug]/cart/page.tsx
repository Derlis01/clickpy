'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Skeleton } from "@heroui/react"

export default function PublicCart() {
  const router = useRouter()

  const actualPath = usePathname()

  const actualCommerceSlug = actualPath.split('/')[1]

  useEffect(() => {
    router.push(`/${actualCommerceSlug}`)
  }, [])

  return (
    <>
      <div className='w-full flex flex-col items-center gap-6 px-4 pt-3'>
        <Skeleton className='rounded-xl w-full' />
        <Skeleton className='rounded-xl w-full h-[100px]' />
        <Skeleton className='rounded-xl w-full h-[100px]' />
        <Skeleton className='rounded-xl w-full h-[100px]' />
        <Skeleton className='rounded-xl w-full h-[100px]' />
      </div>
    </>
  )
}
