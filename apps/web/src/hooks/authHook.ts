import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function useAuth() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check if user has a commerce set up
      const { data: profile } = await supabase
        .from('profiles')
        .select('commerce_id')
        .eq('id', user.id)
        .single()

      if (!profile?.commerce_id) {
        router.push('/welcome')
      }
    }

    checkAuth()
  }, [router])
}
