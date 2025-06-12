'use server'

import { createClient } from '@/lib/supabaseServer'

export async function getArtworks(filters: {
  category?: string
  year?: string
  priceRange?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('ArtPiece')
    .select(`
      *,
      user:profiles!user_id (
        name,
        avatar_url
      ),
      Reaction (
        type,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.year) {
    const startDate = new Date(parseInt(filters.year), 0, 1)
    const endDate = new Date(parseInt(filters.year), 11, 31)
    query = query
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
  }

  if (filters.priceRange) {
    switch (filters.priceRange) {
      case '<50':
        query = query.lt('price', 50)
        break
      case '50-100':
        query = query.gte('price', 50).lte('price', 100)
        break
      case '100-200':
        query = query.gte('price', 100).lte('price', 200)
        break
      case '200+':
        query = query.gt('price', 200)
        break
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching artworks:', error)
    return { error: 'Failed to fetch artworks' }
  }

  // Process the data to include reaction counts
  const processedData = data.map(artwork => {
    const reactions = artwork.Reaction || []
    const likeCount = reactions.filter((r: any) => r.type === 'like').length
    const dislikeCount = reactions.filter((r: any) => r.type === 'dislike').length

    return {
      ...artwork,
      likeCount,
      dislikeCount,
      artist: {
        name: artwork.user?.name || 'Anonymous',
        avatar: artwork.user?.avatar_url || '',
      }
    }
  })

  // Group artworks by category
  const groupedArtworks = processedData.reduce((acc: any, artwork) => {
    const category = artwork.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(artwork)
    return acc
  }, {})

  return { artworks: groupedArtworks }
}

export async function getSuggestedArtists() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .not('name', 'is', null) 
    .limit(4)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching suggested artists:', error)
    return { error: 'Failed to fetch suggested artists' }
  }

  return {
    artists: data.map(artist => ({
      id: artist.id,
      name: artist.name || 'Anonymous',
      avatar: artist.avatar_url || 'https://source.unsplash.com/50?img=1',
    }))
  }
} 