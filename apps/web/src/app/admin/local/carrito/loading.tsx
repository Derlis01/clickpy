import { Skeleton } from "@heroui/react"

export default function Loading() {
  return (
    <div className='w-full flex flex-col items-center px-4 pt-3'>
      <Skeleton className='w-full rounded-md h-[80px] mb-4' />
      <Skeleton className='w-full rounded-md h-[80px] mb-4' />
    </div>
  )
}
