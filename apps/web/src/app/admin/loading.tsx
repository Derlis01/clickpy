import { Skeleton } from "@heroui/react"

export default function Loading() {
  return (
    <div className='w-full flex flex-col items-center gap-6 px-4 pt-3'>
      <Skeleton className='rounded-xl w-full h-[200px]' />
      <Skeleton className='rounded-xl w-full h-[200px]' />
    </div>
  )
}
