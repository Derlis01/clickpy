import { Skeleton } from "@heroui/react"

export default function Loading({ count = 8 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='w-full flex items-center px-4 pt-5 gap-3'>
          <div>
            <Skeleton className='flex rounded-md w-12 h-12' />
          </div>
          <div className='w-full flex flex-col gap-3'>
            <Skeleton className='h-3 w-5/6 rounded-lg' />
            <Skeleton className='h-3 w-3/6 rounded-lg' />
          </div>
        </div>
      ))}
    </div>
  )
}
