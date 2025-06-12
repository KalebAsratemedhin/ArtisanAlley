'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getFollowing, unfollowUser } from '../actions'
import { toast } from 'sonner'
import Link from 'next/link'

interface Following {
  id: string
  name: string | null
  avatar_url: string | null
}

export function FollowingTab({ userId }: { userId: string }) {
  const [following, setFollowing] = useState<Following[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowing()
  }, [userId])

  const loadFollowing = async () => {
    const result = await getFollowing(userId)
    if (result.error) {
      toast.error(result.error)
    } else if (result.following) {
      setFollowing(result.following)
    }
    setLoading(false)
  }

  const handleUnfollow = async (followingId: string) => {
    const result = await unfollowUser(followingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setFollowing(prev => prev.filter(f => f.id !== followingId))
      toast.success(result.success)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading following...</div>
  }

  if (following.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Not following anyone yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {following.map((follow) => (
        <div key={follow.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <Link href={`/profile/${follow.id}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={follow.avatar_url || undefined} />
              <AvatarFallback>
                {follow.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{follow.name || 'Anonymous'}</p>
            </div>
          </Link>
          <Button variant="outline" onClick={() => handleUnfollow(follow.id)}>
            Unfollow
          </Button>
        </div>
      ))}
    </div>
  )
} 