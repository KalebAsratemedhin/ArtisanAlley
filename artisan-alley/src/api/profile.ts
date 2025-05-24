import { supabase } from '@/lib/supabase'

export const getProfileByUserId = async (user_id: string) => {
  return supabase.from('Profile').select('*').eq('user_id', user_id).single()
}

export const createProfile = async (data: { user_id: string }) => {
  return supabase.from('Profile').insert([data]).single()
}

export const updateProfile = async (id: number, data: Partial<{ user_id: string }>) => {
  return supabase.from('Profile').update(data).eq('id', id).single()
}
