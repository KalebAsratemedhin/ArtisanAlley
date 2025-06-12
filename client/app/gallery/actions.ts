'use server'

import { createClient } from '@/lib/supabaseServer'

export async function getUserArtworks() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('ArtPiece')
      .select('id, title, images')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      artworks: data.map((art: any) => ({
        id: art.id,
        title: art.title,
        image: art.images?.[0] || '',
      }))
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch artworks' }
  }
} 