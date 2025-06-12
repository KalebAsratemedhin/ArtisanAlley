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

export async function getArtworkDetails(id: string) {
  console.log('getting art work details for id ', id);
  
  const supabase = await createClient()

  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    // First get the artwork details
    const { data: artwork, error } = await supabase
      .from('ArtPiece')
      .select(`
        id,
        title,
        images,
        price,
        description,
        category,
        user:profiles(
          id,
          name,
          avatar_url
        ),
        Reaction (
          type,
          user_id
        ),
        Comment (
          id,
          comment,
          created_at,
          user_id,
          parent_id,
          user:profiles(
            id,
            name,
            avatar_url
          ),
          CommentReaction (
            type,
            user_id
          ),
          replies:Comment!parent_id(
            id,
            comment,
            created_at,
            user_id,
            user:profiles(
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
      throw error
    }

    // Type assertion for the artwork data
    const artworkData = artwork as unknown as Artwork;

    // Get related artworks from same artist
    const { data: relatedArtworks, error: relatedError } = await supabase
      .from('ArtPiece')
      .select('id, title, images')
      .eq('user_id', artworkData.user.id)
      .neq('id', id)
      .limit(4)

    if (relatedError) {
      throw relatedError
    }

    // Process reactions
    const reactions = artworkData.Reaction || []
    const likeCount = reactions.filter(r => r.type === 'like').length
    const dislikeCount = reactions.filter(r => r.type === 'dislike').length
    
    // Process comments
    const comments = (artworkData.Comment || [])
      .filter(comment => !comment.parent_id)
      .map(comment => {
        const commentReactions = comment.CommentReaction || []

        const likeCount = commentReactions.filter(r => r.type === 'like').length
        const dislikeCount = commentReactions.filter(r => r.type === 'dislike').length

        
        const userReaction = user ? commentReactions.find(r => r.user_id === user.id)?.type || null : null

        const replies = (comment.replies || []).map(reply => {
          const replyReactions = reply.CommentReaction || []
          const replyUserReaction = user ? replyReactions.find(r => r.user_id === user.id)?.type || null : null

          return {
            id: reply.id,
            comment: reply.comment,
            created_at: reply.created_at,
            user_id: reply.user_id,
            name: reply.user?.name || 'Anonymous',
            avatar_url: reply.user?.avatar_url || '',
            userReaction: replyUserReaction
          }
        })

        return {
          id: comment.id,
          comment: comment.comment,
          created_at: comment.created_at,
          user_id: comment.user_id,
          name: comment.user?.name || 'Anonymous',
          avatar_url: comment.user?.avatar_url || '',
          userReaction,
          replies,
          likeCount,
          dislikeCount
        }
      })

    return {
      artwork: {
        id: artworkData.id,
        title: artworkData.title,
        description: artworkData.description,
        price: artworkData.price,
        images: artworkData.images || [],
        category: artworkData.category,
        artist: {
          id: artworkData.user.id,
          name: artworkData.user.name || 'Unknown Artist',
          avatar_url: artworkData.user.avatar_url || ''
        },
        relatedArtworks: relatedArtworks.map(art => ({
          id: art.id,
          title: art.title,
          image: art.images?.[0] || '',
        })),
        reactions: {
          likeCount,
          dislikeCount,
        },
        comments,
      }
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch artwork details' }
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