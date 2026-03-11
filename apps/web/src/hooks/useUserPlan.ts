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
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_plan')
          .eq('id', user.id)
          .single()

        if (profile?.current_plan) {
          setCurrentPlan(profile.current_plan as PlanType)
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
