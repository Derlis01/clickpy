'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import WelcomeWizard from './components/WelcomeWizard'

export default function Welcome() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const checkCommerceStatus = async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // If user already belongs to an organization, skip the wizard
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('profile_id', user.id)
        .limit(1)
        .maybeSingle()

      if (membership?.organization_id) {
        router.push('/admin')
        return
      }

      setReady(true)
    }

    checkCommerceStatus()
  }, [router])

  if (!ready) return null

  return (
    <div className='flex justify-center items-center min-h-screen px-5 py-16'>
      <WelcomeWizard />
    </div>
  )
}
