import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message, error)
    }

    if (!error) {
      // Check if user has a profile with a commerce already set up
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('profile_id', user.id)
          .limit(1)
          .maybeSingle()

        if (membership?.organization_id) {
          return NextResponse.redirect(`${origin}/admin`)
        }

        return NextResponse.redirect(`${origin}/welcome`)
      }
    }
  }

  // Auth failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
