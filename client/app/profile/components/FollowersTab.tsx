'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getFollowers, followUser, unfollowUser, isFollowing } from '../actions'
import { toast } from 'sonner'
import Link from 'next/link'

interface Follower {
  id: string
  name: string | null
  avatar_url: string | null
}

export function FollowersTab({ userId }: { userId: string }) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [followingStatus, setFollowingStatus] = useState<{[key: string]: boolean}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowers()
  }, [userId])

  const loadFollowers = async () => {
    const result = await getFollowers(userId)
    if (result.error) {
      toast.error(result.error)
    } else if (result.followers) {
      setFollowers(result.followers)
      // Check following status for each follower
      const statusPromises = result.followers.map(async (follower) => {
        const status = await isFollowing(follower.id)
        return [follower.id, status]
      })
      const statuses = await Promise.all(statusPromises)
      setFollowingStatus(Object.fromEntries(statuses))
    }
    setLoading(false)
  }

  const handleFollow = async (followerId: string) => {
    const result = await followUser(followerId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setFollowingStatus(prev => ({ ...prev, [followerId]: true }))
      toast.success(result.success)
    }
  }

  const handleUnfollow = async (followerId: string) => {
    const result = await unfollowUser(followerId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setFollowingStatus(prev => ({ ...prev, [followerId]: false }))
      toast.success(result.success)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading followers...</div>
  }

  if (followers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No followers yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {followers.map((follower) => (
        <div key={follower.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <Link href={`/profile/${follower.id}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={follower.avatar_url || undefined} />
              <AvatarFallback>
                {follower.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{follower.name || 'Anonymous'}</p>
            </div>
          </Link>
          {followingStatus[follower.id] ? (
            <Button variant="outline" onClick={() => handleUnfollow(follower.id)}>
              Unfollow
            </Button>
          ) : (
            <Button onClick={() => handleFollow(follower.id)}>
              Follow Back
            </Button>
          )}
        </div>
      ))}
    </div>
  )
} 