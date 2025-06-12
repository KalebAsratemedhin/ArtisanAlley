import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if no code, redirect to login
  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  // if error, redirect to login
  if (error) {
    return NextResponse.redirect(`${origin}/login`)
  }

  return NextResponse.redirect(`${origin}/private`)
} 