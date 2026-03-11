'use client'

import { Skeleton } from "@heroui/react"

export default function PublicProductCardSkeleton() {
  return (
    <div className='flex w-full justify-between md:justify-start flex-wrap'>
      <Skeleton className='w-full sm:w-[49%] max-w-[350px] md:max-w-[180px] h-[200px] md:mx-2 border mb-3 rounded-xl' />
      <Skeleton className='w-full sm:w-[49%] max-w-[350px] md:max-w-[180px] h-[200px] md:mx-2 border mb-3 rounded-xl' />
      <Skeleton className='w-full sm:w-[49%] max-w-[350px] md:max-w-[180px] h-[200px] md:mx-2 border mb-3 rounded-xl' />
      <Skeleton className='w-full sm:w-[49%] max-w-[350px] md:max-w-[180px] h-[200px] md:mx-2 border mb-3 rounded-xl' />
      <Skeleton className='w-full sm:w-[49%] max-w-[350px] md:max-w-[180px] h-[200px] md:mx-2 border mb-3 rounded-xl' />
      <Skeleton className='w-full sm:w-[49%] max-w-[350px] md:max-w-[180px] h-[200px] md:mx-2 border mb-3 rounded-xl' />
    </div>
  )
}
