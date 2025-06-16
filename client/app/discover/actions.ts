'use server'

import { createClient } from '@/lib/supabaseServer'

export async function getArtworks(filters: {
  category?: string
  year?: string
  priceRange?: string
}) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

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

  // Exclude current user's artworks
  if (user) {
    query = query.neq('user_id', user.id)
  }

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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get artists with their profiles and follower counts
    let query = supabase
    .from('profiles')
    .select(`
      id,
      name,
      avatar_url,
      followers:follows!following_id(count)
    `)
    .not('name', 'is', null);

  if (user?.id) {
    query = query.not('id', 'eq', user.id);
  }

  const { data, error } = await query;
// Exclude current user

  if (error) {
    console.error('Error fetching suggested artists:', error)
    return { error: 'Failed to fetch suggested artists' }
  }

  // Process and sort artists by follower count
  const processedArtists = data
    .map(artist => ({
      id: artist.id,
      name: artist.name || 'Anonymous',
      avatar: artist.avatar_url || 'https://source.unsplash.com/50?img=1',
      followers: (artist.followers || []).length
    }))
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 4) // Take top 4

  return { artists: processedArtists }
} 