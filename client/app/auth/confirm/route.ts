import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/private'

  console.log("code", code)

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return redirect(next)
    }
  }

  return redirect('/login')
}
