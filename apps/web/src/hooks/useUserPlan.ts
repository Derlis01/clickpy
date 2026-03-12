'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type PlanType = 'free' | 'entrepreneur' | 'business' | 'enterprise'

export function useUserPlan() {
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organizations(plan)')
          .eq('profile_id', user.id)
          .limit(1)
          .maybeSingle()

        const org = membership?.organizations as any
        if (org?.plan) {
          setCurrentPlan(org.plan as PlanType)
        } else {
          setCurrentPlan('free')
        }
      }

      setLoading(false)
    }

    fetchPlan()
  }, [])

  return { currentPlan, loading }
}
