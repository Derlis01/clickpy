import { Skeleton } from "@heroui/react"

export default function Loading() {
  return (
    <div className='w-full flex flex-col items-center px-4 pt-3'>
      <Skeleton className='w-full rounded-md h-[100px]' />
      <div className='relative w-full h-[100px] px-5'>
        <Skeleton className='rounded-2xl w-[110px] h-[85px] absolute top-[-30px]' />
      </div>
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
      <Skeleton className='w-full rounded-md h-[40px] mb-4' />
    </div>
  )
}
