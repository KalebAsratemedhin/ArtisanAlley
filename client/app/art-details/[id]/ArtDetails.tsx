'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { ImageCarousel } from './components/ImageCarousel'
import { getArtworkDetails, handleReaction, addComment, addReply, handleCommentReactionApi, checkIfFollowing, toggleFollow } from './actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { ThumbsUp, ThumbsDown, Plus, ShoppingCart, Loader2, UserPlus, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useCartStore } from '@/lib/store/cart'

interface Artist {
  id: string
  name: string
  avatar_url: string
}

interface RelatedArtwork {
  id: string
  title: string
  image: string
}

interface Comment {
  id: string
  comment: string
  created_at: string
  user_id: string
  name: string
  avatar_url: string
  userReaction: 'like' | 'dislike' | null
  likeCount: number
  dislikeCount: number
  replies?: Comment[]
}

interface ArtworkDetails {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  artist: Artist
  relatedArtworks: RelatedArtwork[]
  sameCategoryArtworks: {
    id: string
    title: string
    image: string
    price: number
    artist: {
      name: string
      avatar_url: string
    }
  }[]
  reactions: {
    likeCount: number
    dislikeCount: number
    userReaction: 'like' | 'dislike' | null
  }
  comments: Comment[]
}

interface ArtworkResponse {
  artwork?: ArtworkDetails
  error?: string
}

export default function ArtDetails({ id }: { id: string }) {
  const router = useRouter()
  const [artwork, setArtwork] = useState<ArtworkDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCommentPosting, setIsCommentPosting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isReplyPosting, setIsReplyPosting] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  useEffect(() => {
    async function fetchUserAndArtwork() {
      setIsLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      const result = await getArtworkDetails(id)
      
      if (result.error) {
        setError(result.error)
      } else if (result.artwork) {
        // Ensure all required fields are present with defaults
        const processedArtwork: ArtworkDetails = {
          ...result.artwork,
          description: result.artwork.description || '',
          images: result.artwork.images || [],
          category: result.artwork.category || '',
          artist: {
            ...result.artwork.artist,
            avatar_url: result.artwork.artist.avatar_url || ''
          },
          sameCategoryArtworks: (result.artwork.sameCategoryArtworks || []).map(art => ({
            ...art,
            artist: {
              ...art.artist,
              avatar_url: art.artist.avatar_url || ''
            }
          })),
          comments: (result.artwork.comments || []).map(comment => ({
            ...comment,
            avatar_url: comment.avatar_url || '',
            replies: (comment.replies || []).map(reply => ({
              ...reply,
              avatar_url: reply.avatar_url || ''
            }))
          }))
        }
        
        setArtwork(processedArtwork)
        setLikeCount(result.artwork.reactions.likeCount)
        setDislikeCount(result.artwork.reactions.dislikeCount)
        setComments(processedArtwork.comments)
        
        // Check if following
        if (user) {
          const followResult = await checkIfFollowing(result.artwork.artist.id)
          setIsFollowing(followResult.isFollowing)
        }

        // Set initial user reaction
        if (user) {
          setUserReaction(result.artwork.reactions.userReaction)
        }
      }
      setIsLoading(false)
    }

    fetchUserAndArtwork()
  }, [id])

  const handleReactionClick = async (type: 'like' | 'dislike') => {
    if (!artwork) return

    try {
      const result = await handleReaction(artwork.id, type)
      if (result.error) {
        toast.error(result.error)
        return
      }

      // Update counts based on previous reaction
      if (type === 'like') {
        if (userReaction === 'dislike') {
          setLikeCount(prev => prev + 1)
          setDislikeCount(prev => prev - 1)
        } else if (userReaction === 'like') {
          setLikeCount(prev => prev - 1)
          setUserReaction(null)
          return
        } else {
          setLikeCount(prev => prev + 1)
        }
      } else {
        if (userReaction === 'like') {
          setDislikeCount(prev => prev + 1)
          setLikeCount(prev => prev - 1)
        } else if (userReaction === 'dislike') {
          setDislikeCount(prev => prev - 1)
          setUserReaction(null)
          return
        } else {
          setDislikeCount(prev => prev + 1)
        }
      }

      setUserReaction(type)
      toast.success(result.success)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update reaction')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artwork || !newComment.trim() || isCommentPosting) return

    setIsCommentPosting(true)
    try {
      const result = await addComment(artwork.id, newComment.trim())
      if (result.error) {
        toast.error(result.error)
        return
      }

      // Refresh artwork details to get updated comments
      const updatedArtwork = await getArtworkDetails(id)
      if (updatedArtwork.artwork) {
        setComments(updatedArtwork.artwork.comments)
      }

      setNewComment('')
      toast.success('Comment posted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add comment')
    } finally {
      setIsCommentPosting(false)
    }
  }

  const handleCommentReaction = async (commentId: string, type: 'like' | 'dislike') => {
    try {
      const result = await handleCommentReactionApi(commentId, type)
      if (result.error) {
        toast.error(result.error)
        return
      }

      // Refresh artwork details to get updated comments
      const updatedArtwork = await getArtworkDetails(id)
      if (updatedArtwork.artwork) {
        setComments(updatedArtwork.artwork.comments)
      }

      toast.success(result.success)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update reaction')
    }
  }

  const handleReply = async (commentId: string) => {
    if (!replyText.trim() || isReplyPosting) return

    setIsReplyPosting(true)
    try {
      const result = await addReply(commentId, replyText.trim())
      if (result.error) {
        toast.error(result.error)
        return
      }

      // Refresh artwork details to get updated comments
      const updatedArtwork = await getArtworkDetails(id)
      if (updatedArtwork.artwork) {
        setComments(updatedArtwork.artwork.comments)
      }

      setReplyText('')
      setReplyingTo(null)
      toast.success('Reply posted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add reply')
    } finally {
      setIsReplyPosting(false)
    }
  }

  const handleAddToCart = () => {
    if (!artwork) return
    
    addItem({
      id: artwork.id,
      title: artwork.title,
      price: artwork.price,
      image: artwork.images[0],
      artistId: artwork.artist.id,
    })
    
    toast.success('Added to cart!')
  }

  const handleFollowClick = async () => {
    if (!artwork || isFollowLoading) return
    
    setIsFollowLoading(true)
    try {
      const result = await toggleFollow(artwork.artist.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsFollowing(!isFollowing)
        toast.success(result.success)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update follow status')
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center text-red-500">
          {error || 'Artwork not found'}
        </div>
      </div>
    )
  }

  const isOwner = currentUserId === artwork.artist.id

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <ImageCarousel images={artwork.images} />

        {/* Title and Price */}
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{artwork.title}</h1>
          <div className="text-right">
            <p className="text-2xl font-bold">${artwork.price.toFixed(2)}</p>
            {!isOwner && (
              <Button
                className="mt-2 w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>

        { (
          <div className="flex items-center gap-4">
            {/* Like */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={userReaction === 'like' ? 'text-blue-500' : ''}
                onClick={() => handleReactionClick('like')}
              >
                <ThumbsUp className="w-5 h-5" />
              </Button>
              <span className="text-sm">{likeCount}</span>
            </div>

            {/* Dislike */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={userReaction === 'dislike' ? 'text-red-500' : ''}
                onClick={() => handleReactionClick('dislike')}
              >
                <ThumbsDown className="w-5 h-5" />
              </Button>
              <span className="text-sm">{dislikeCount}</span>
            </div>

            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={handleFollowClick}
              disabled={isFollowLoading || isOwner}
            >
              {isFollowLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <UserCheck className="w-4 h-4 text-green-600" />
              ) : (
                <UserPlus className="w-4 h-4 text-blue-950" />
              )}
              {isFollowing ? 'Following' : `Follow ${artwork.artist.name}`}
            </Button>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{artwork.description}</p>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <div className="space-y-4">
            {comments.map((comment) => {
              const isCommentOwner = currentUserId === comment.user_id
              return (
                <div key={comment.id}>
                  <div className="p-4 bg-muted rounded-md flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.avatar_url} />
                      <AvatarFallback>
                        {comment.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{comment.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.comment}
                      </p>
                      {!isCommentOwner && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCommentReaction(comment.id, 'like')}
                              className={comment.userReaction === 'like' ? 'text-blue-500' : ''}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <span className="text-sm">{comment.likeCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCommentReaction(comment.id, 'dislike')}
                              className={comment.userReaction === 'dislike' ? 'text-red-500' : ''}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                            <span className="text-sm">{comment.dislikeCount}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs px-2 py-0 h-6"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleReply(comment.id)
                      }} 
                      className="mt-2 ml-12 flex items-center gap-2"
                    >
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        type="submit" 
                        disabled={isReplyPosting}
                      >
                        {isReplyPosting ? 'Posting...' : 'Reply'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-12 mt-2 space-y-2">
                      {comment.replies.map((reply) => {
                        const isReplyOwner = currentUserId === reply.user_id
                        return (
                          <div
                            key={reply.id}
                            className="p-3 bg-muted/50 rounded-md flex gap-3"
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={reply.avatar_url} />
                              <AvatarFallback>
                                {reply.name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{reply.name}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {reply.comment}
                              </p>
                              {!isReplyOwner && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleCommentReaction(reply.id, 'like')}
                                      className={reply.userReaction === 'like' ? 'text-blue-500' : ''}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <span className="text-xs">{reply.likeCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleCommentReaction(reply.id, 'dislike')}
                                      className={reply.userReaction === 'dislike' ? 'text-red-500' : ''}
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                    </Button>
                                    <span className="text-xs">{reply.dislikeCount}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {!isOwner && (
            <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <Button size="sm" type="submit" disabled={isCommentPosting}>
                {isCommentPosting ? 'Posting...' : 'Post'}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Artist Info */}
        <div>
          <h4 className="font-semibold mb-2">
            More by {artwork.artist.name}
          </h4>
          <div className="grid gap-4">
            {artwork.relatedArtworks.map((art) => (
              <Link
                key={art.id}
                href={`/art-details/${art.id}`}
                className="block group"
              >
                <Card className="overflow-hidden pt-0">
                  <div className="relative aspect-square">
                    <Image
                      src={art.image}
                      alt={art.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2">
                    <p className="font-medium truncate">{art.title}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Same Category */}
        <div>
          <h4 className="font-semibold mb-2">More in {artwork.category}</h4>
          <div className="grid gap-4">
            {artwork.sameCategoryArtworks.map((art) => (
              <Link
                key={art.id}
                href={`/art-details/${art.id}`}
                className="block group"
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image
                      src={art.image}
                      alt={art.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white font-bold">
                        ${art.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="font-medium truncate">{art.title}</p>
                    <div className="flex items-center gap-2">
                      <Image
                        src={art.artist.avatar_url}
                        alt={art.artist.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                      <p className="text-xs text-muted-foreground truncate">
                        {art.artist.name}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  )
} 