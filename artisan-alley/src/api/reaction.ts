import { supabase } from '@/lib/supabase'

export const getReactionsByArtPiece = async (art_piece_id: number) => {
  return supabase.from('Reaction').select('*').eq('art_piece_id', art_piece_id)
}

export const addReaction = async (data: {
  art_piece_id: number
  user_id: string
  type: string
}) => {
  return supabase.from('Reaction').upsert([data], { onConflict: 'art_piece_id, user_id' }).single()
}

export const removeReaction = async (art_piece_id: number, user_id: string) => {
  return supabase.from('Reaction').delete().eq('art_piece_id', art_piece_id).eq('user_id', user_id)
}
