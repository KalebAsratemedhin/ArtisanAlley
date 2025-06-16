'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface Reaction {
  type: 'like' | 'dislike';
  user_id: string;
}

interface CommentReaction {
  type: 'like' | 'dislike';
  user_id: string;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  user: Profile;
  CommentReaction: CommentReaction[];
  replies?: Comment[];
}

interface Artwork {
  id: string;
  title: string;
  images: string[] | null;
  price: number;
  description: string | null;
  category: string | null;
  user: Profile;
  Reaction: Reaction[];
  Comment: Comment[];
}

interface ArtworkResponse {
  artwork?: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[] | null;
    category: string | null;
    artist: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    relatedArtworks: {
      id: string;
      title: string;
      image: string;
    }[];
    sameCategoryArtworks: {
      id: string;
      title: string;
      image: string;
      price: number;
      artist: {
        name: string;
        avatar_url: string | null;
      };
    }[];
    reactions: {
      likeCount: number;
      dislikeCount: number;
      userReaction: 'like' | 'dislike' | null;
    };
    comments: {
      id: string;
      comment: string;
      created_at: string;
      user_id: string;
      name: string;
      avatar_url: string | null;
      userReaction: 'like' | 'dislike' | null;
      likeCount: number;
      dislikeCount: number;
      replies: {
        id: string;
        comment: string;
        created_at: string;
        user_id: string;
        name: string;
        avatar_url: string | null;
        userReaction: 'like' | 'dislike' | null;
        likeCount: number;
        dislikeCount: number;
      }[];
    }[];
  };
  error?: string;
}

export async function getArtworkDetails(id: string): Promise<ArtworkResponse> {
  const supabase = await createClient()

  // Get current user for reaction status
  const { data: { user } } = await supabase.auth.getUser()

  // First get the main artwork
  const { data: artwork, error } = await supabase
    .from('ArtPiece')
    .select(`
      *,
      artist:profiles!user_id (
        id,
        name,
        avatar_url
      ),
      Reaction (
        type,
        user_id
      ),
      comments:Comment (
        id,
        comment,
        created_at,
        user_id,
        user:profiles!user_id (
          name,
          avatar_url
        ),
        CommentReaction (
          type,
          user_id
        ),
        replies:Comment!parent_id (
          id,
          comment,
          created_at,
          user_id,
          user:profiles!user_id (
            name,
            avatar_url
          ),
          CommentReaction (
            type,
            user_id
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching artwork:', error)
    return { error: 'Failed to fetch artwork details' }
  }

  if (!artwork) {
    return { error: 'Artwork not found' }
  }

  // Get related artworks by the same artist
  const { data: relatedByArtist } = await supabase
    .from('ArtPiece')
    .select('id, title, images')
    .eq('user_id', artwork.user_id)
    .neq('id', id)
    .limit(4)

  // Get artworks in the same category
  const { data: sameCategory } = await supabase
    .from('ArtPiece')
    .select(`
      id, 
      title, 
      images,
      price,
      artist:profiles!user_id (
        name,
        avatar_url
      )
    `)
    .eq('category', artwork.category)
    .neq('id', id)
    .neq('user_id', artwork.user_id)  // Exclude same artist's works
    .limit(4)

  // Process reactions
  const reactions = artwork.Reaction || []
  const likeCount = reactions.filter(r => r.type === 'like').length
  const dislikeCount = reactions.filter(r => r.type === 'dislike').length
  const userReaction = user ? reactions.find(r => r.user_id === user.id)?.type || null : null

  // Process comments
  const processedComments = (artwork.comments || []).map(comment => {
    const commentReactions = comment.CommentReaction || []
    const commentLikeCount = commentReactions.filter(r => r.type === 'like').length
    const commentDislikeCount = commentReactions.filter(r => r.type === 'dislike').length
    const commentUserReaction = user ? commentReactions.find(r => r.user_id === user.id)?.type || null : null

    // Process replies
    const processedReplies = (comment.replies || []).map(reply => {
      const replyReactions = reply.Reaction || []
      const replyLikeCount = replyReactions.filter(r => r.type === 'like').length
      const replyDislikeCount = replyReactions.filter(r => r.type === 'dislike').length
      const replyUserReaction = user ? replyReactions.find(r => r.user_id === user.id)?.type || null : null

      return {
        id: reply.id,
        comment: reply.comment,
        created_at: reply.created_at,
        user_id: reply.user_id,
        name: reply.user?.name || 'Anonymous',
        avatar_url: reply.user?.avatar_url || '',
        userReaction: replyUserReaction,
        likeCount: replyLikeCount,
        dislikeCount: replyDislikeCount,
      }
    })

    return {
      id: comment.id,
      comment: comment.comment,
      created_at: comment.created_at,
      user_id: comment.user_id,
      name: comment.user?.name || 'Anonymous',
      avatar_url: comment.user?.avatar_url || '',
      userReaction: commentUserReaction,
      likeCount: commentLikeCount,
      dislikeCount: commentDislikeCount,
      replies: processedReplies,
    }
  })

  return {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description || '',
      price: artwork.price,
      images: artwork.images,
      category: artwork.category || '',
      artist: {
        id: artwork.artist.id,
        name: artwork.artist.name,
        avatar_url: artwork.artist.avatar_url,
      },
      relatedArtworks: relatedByArtist?.map(art => ({
        id: art.id,
        title: art.title,
        image: art.images[0],
      })) || [],
      sameCategoryArtworks: sameCategory?.map(art => ({
        id: art.id,
        title: art.title,
        image: art.images[0],
        price: art.price,
        artist: {
          name: art.artist.name,
          avatar_url: art.artist.avatar_url,
        }
      })) || [],
      reactions: {
        likeCount,
        dislikeCount,
        userReaction,
      },
      comments: processedComments,
    }
  }
}

export async function handleReaction(artworkId: string, type: 'like' | 'dislike') {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'You must be logged in to react to artworks' }
    }

    // Check if user owns the artwork
    const { data: artwork } = await supabase
      .from('ArtPiece')
      .select('user_id')
      .eq('id', artworkId)
      .single()

    if (artwork?.user_id === user.id) {
      return { error: 'You cannot react to your own artwork' }
    }

    // Upsert the reaction
    const { error } = await supabase
      .from('Reaction')
      .upsert(
        {
          art_piece_id: artworkId,
          user_id: user.id,
          type,
        },
        { 
          onConflict: 'art_piece_id,user_id',
          ignoreDuplicates: false
         }
      )
    if (error) throw error

    revalidatePath(`/art-details/${artworkId}`)
    return { success: 'Reaction updated successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to update reaction' }
  }
}

export async function addComment(artworkId: string, comment: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'You must be logged in to comment' }
    }

    // Check if user owns the artwork
    const { data: artwork } = await supabase
      .from('ArtPiece')
      .select('user_id')
      .eq('id', artworkId)
      .single()

    if (artwork?.user_id === user.id) {
      return { error: 'You cannot comment on your own artwork' }
    }

    const { error } = await supabase
      .from('Comment')
      .insert({
        art_piece_id: artworkId,
        user_id: user.id,
        comment,
      })

    if (error) throw error

    revalidatePath(`/art-details/${artworkId}`)
    return { success: 'Comment added successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to add comment' }
  }
}

export async function handleCommentReactionApi(commentId: string, type: 'like' | 'dislike') {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'You must be logged in to react to comments' }
    }

    // Get the comment to check ownership
    const { data: comment } = await supabase
      .from('Comment')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return { error: 'Comment not found' }
    }

    if (comment.user_id === user.id) {
      return { error: 'You cannot react to your own comment' }
    }

    // Upsert the reaction
    const { error } = await supabase
      .from('CommentReaction')
      .upsert(
        {
          comment_id: commentId,
          user_id: user.id,
          type,
        },
        { onConflict: 'comment_id,user_id' }
      )

    if (error) throw error

    return { success: 'Reaction updated successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to update reaction' }
  }
}

export async function addReply(commentId: string, reply: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'You must be logged in to reply' }
    }

    // Get the comment and artwork info
    const { data: comment } = await supabase
      .from('Comment')
      .select('art_piece_id, user_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return { error: 'Comment not found' }
    }

    // Add the reply
    const { error } = await supabase
      .from('Comment')
      .insert({
        art_piece_id: comment.art_piece_id,
        user_id: user.id,
        comment: reply,
        parent_id: commentId,
      })

    if (error) throw error

    revalidatePath(`/art-details/${comment.art_piece_id}`)
    return { success: 'Reply added successfully' }
  } catch (err: any) {
    return { error: err.message || 'Failed to add reply' }
  }
}

export async function toggleFollow(artistId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in to follow artists' }
  }

  // Check if already following
  const { data: existingFollow } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('following_id', artistId)
    .single()

  if (existingFollow) {
    // Unfollow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', artistId)

    if (error) {
      return { error: 'Failed to unfollow artist' }
    }
    return { success: 'Successfully unfollowed artist' }
  } else {
    // Follow
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: artistId,
      })

    if (error) {
      return { error: 'Failed to follow artist' }
    }
    return { success: 'Successfully followed artist' }
  }
}

export async function checkIfFollowing(artistId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { isFollowing: false }
  }

  const { data } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('following_id', artistId)
    .single()

  return { isFollowing: !!data }
} 