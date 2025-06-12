'use server'

import { createClient } from '@/lib/supabaseServer'

export async function searchContent(query: string) {
  const supabase = await createClient()
  
  // Search users
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .ilike('name', `%${query}%`)
    .limit(5)

    console.log(usersError)

  // Search artpieces
  const { data: artpieces, error: artpiecesError } = await supabase
    .from('ArtPiece')
    .select('id, title, images, profiles(name)')
    .ilike('title', `%${query}%`)
    .limit(5)

    console.log(artpiecesError)


  if (usersError || artpiecesError) {
    throw new Error('Failed to search')
  }

  console.log(users)
  console.log(artpieces)

  return {
    users: users || [],
    artpieces: artpieces || []
  }
} 