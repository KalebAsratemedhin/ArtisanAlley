'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabaseServer'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/private')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: { user } } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`
    }
  })

  if (error) {
    console.log("error ", error)
    redirect('/error')
  }

  if (user?.identities?.length === 0) {
    // User already exists
    return { error: 'User already exists. Please login instead.' }
  }

  return { success: 'Check your email for the confirmation link.' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}