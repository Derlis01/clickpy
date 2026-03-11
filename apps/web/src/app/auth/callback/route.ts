import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a profile with a commerce already set up
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('commerce_id')
          .eq('id', user.id)
          .single()

        if (profile?.commerce_id) {
          return NextResponse.redirect(`${origin}/admin`)
        }

        return NextResponse.redirect(`${origin}/welcome`)
      }
    }
  }

  // Auth failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
