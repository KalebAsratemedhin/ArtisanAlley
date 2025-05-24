import { supabase } from '@/lib/supabase'

export const getCommentsByArtPiece = async (art_piece_id: number) => {
  return supabase.from('Comment').select('*').eq('art_piece_id', art_piece_id).order('created_at', { ascending: false })
}

export const addComment = async (data: {
  art_piece_id: number
  user_id: string
  comment: string
}) => {
  return supabase.from('Comment').upsert([data], { onConflict: 'art_piece_id, user_id' })
}

export const deleteComment = async (art_piece_id: number, user_id: string) => {
  return supabase.from('Comment').delete().eq('art_piece_id', art_piece_id).eq('user_id', user_id)
}
