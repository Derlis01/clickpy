import type { Metadata } from 'next'
import DashboardLayout from '@/components/admin/DashboardLayout'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Clickpy',
  description: 'Clickpy admin dashboard'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className='min-h-screen bg-gray-50' />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  )
}
