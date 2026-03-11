import { Card, CardBody, Skeleton } from '@heroui/react'

export function InsightCardSkeleton() {
  return (
    <Card className='shadow-sm'>
      <CardBody className='p-6 space-y-4'>
        <Skeleton className='w-24 h-5 rounded-full' />
        <div className='space-y-3'>
          <Skeleton className='h-6 w-full rounded-lg' />
          <Skeleton className='h-4 w-4/5 rounded-lg' />
        </div>
      </CardBody>
    </Card>
  )
}

export function InsightSkeletonGrid() {
  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {[...Array(6)].map((_, i) => (
        <InsightCardSkeleton key={i} />
      ))}
    </div>
  )
}
