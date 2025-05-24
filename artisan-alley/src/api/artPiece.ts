import { supabase } from '@/lib/supabase'

export const getArtPieces = async () => {
  return supabase.from('ArtPiece').select('*').order('created_at', { ascending: false })
}

export const getArtPieceById = async (id: number) => {
  return supabase.from('ArtPiece').select('*').eq('id', id).single()
}

export const createArtPiece = async (data: {
  title?: string
  description?: string
  price?: number
  category?: string
  user_id?: string
  images?: string[]
}) => {
  return supabase.from('ArtPiece').insert([data]).single()
}

export const updateArtPiece = async (id: number, data: Partial<{
  title: string
  description: string
  price: number
  category: string
  images: string[]
}>) => {
  return supabase.from('ArtPiece').update(data).eq('id', id)
}

export const deleteArtPiece = async (id: number) => {
  return supabase.from('ArtPiece').delete().eq('id', id)
}
