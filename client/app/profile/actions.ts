'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { profile: data }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const avatarUrl = formData.get('avatarUrl') as string

  // Update email in auth if it has changed
  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email })
    if (emailError) {
      return { error: emailError.message }
    }
  }

  // Update profile in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      email,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/profile')
  return { success: 'Profile updated successfully' }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const file = formData.get('avatar') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  // Upload the file to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const { error: uploadError, data } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/profile')
  return { success: 'Avatar updated successfully', url: publicUrl }
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient()
  const newEmail = formData.get('email') as string

  const { error } = await supabase.auth.updateUser({ email: newEmail })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Email update confirmation sent' }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password updated successfully' }
}

export async function followUser(userId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  if (user.id == userId) {
    return { error: 'You cannot follow yourself' }
  }
  // Check if already following
  const { data: existingFollow } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()
  
  if (existingFollow) {
    return { error: 'Already following this user' }
  }

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: userId
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath(`/profile/${userId}`)
  return { success: 'Successfully followed user' }
}

export async function unfollowUser(userId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath(`/profile/${userId}`)
  return { success: 'Successfully unfollowed user' }
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient()

  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('follows')
      .select('follower_id', { count: 'exact' })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('following_id', { count: 'exact' })
      .eq('follower_id', userId)
  ])

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0
  }
}

export async function getFollowers(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower:profiles!follower_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { followers: data.map(item => item.follower) }
}

export async function getFollowing(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select(`
      following:profiles!following_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { following: data.map(item => item.following) }
}

export async function isFollowing(targetUserId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return false
  }

  const { data } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  return !!data
}

export async function getUserArtworksById(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ArtPiece')
    .select(`
      *,
      user:profiles!user_id (
        id,
        name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { artworks: data }
}