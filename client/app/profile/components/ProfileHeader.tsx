'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateProfile, uploadAvatar, followUser, unfollowUser, isFollowing } from '../actions'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

interface Props {
  user: User
  profile: {
    name: string | null
    avatar_url: string | null
    email: string | null
  }
  followCounts: {
    followers: number
    following: number
  }
  isOwnProfile?: boolean
}

export function ProfileHeader({ user, profile, followCounts, isOwnProfile = true }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isOwnProfile) {
      checkFollowStatus()
    }
  }, [isOwnProfile, user.id])

  const checkFollowStatus = async () => {
    const status = await isFollowing(user.id)
    setIsFollowingUser(status)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await updateProfile(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      setIsEditing(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('avatar', e.target.files[0])

      const result = await uploadAvatar(formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
      }
    } catch (error) {
      toast.error('Error uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleFollow = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await followUser(user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsFollowingUser(true)
        toast.success(result.success)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await unfollowUser(user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsFollowingUser(false)
        toast.success(result.success)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = () => {
    router.push(`/chat?userId=${user.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Image
            src={profile.avatar_url || 'https://source.unsplash.com/100x100/?avatar'}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
          {isOwnProfile && (
            <label className="absolute bottom-0 right-0 cursor-pointer">
              <div className="rounded-full p-1 text-white bg-white hover:bg-gray-800">
                📷
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profile.name || 'Anonymous'}</h1>
              <p className="text-muted-foreground">{profile.email || user.email}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{followCounts.followers} followers</span>
                <span>{followCounts.following} following</span>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      name="name"
                      defaultValue={profile.name || ''}
                      placeholder="Your name"
                      className="max-w-sm"
                    />
                    <Input
                      name="email"
                      type="email"
                      defaultValue={profile.email || user.email || ''}
                      placeholder="Your email"
                      className="max-w-sm"
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )
              ) : (
                <>
                  <Button
                    variant={isFollowingUser ? "outline" : "default"}
                    onClick={isFollowingUser ? handleUnfollow : handleFollow}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : isFollowingUser ? "Unfollow" : "Follow"}
                  </Button>
                  <Button onClick={handleMessage}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 