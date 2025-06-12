'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export type ChatParticipant = {
  participant_id: string
  participant_name: string
  participant_avatar: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export type Message = {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  read_at: string | null
  sender: {
    name: string
    avatar_url: string
  }
}

export async function getChatParticipants() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .rpc('get_chat_participants', { user_id: user.id })

  if (error) {
    return { error: error.message }
  }

  return { participants: data as ChatParticipant[] }
}

export async function getMessages(participantId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id (
        name,
        avatar_url
      )
    `)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  // Mark messages as read
  const messagesToUpdate = data
    .filter(msg => msg.receiver_id === user.id && !msg.read_at)
    .map(msg => msg.id)

  if (messagesToUpdate.length > 0) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messagesToUpdate)

    revalidatePath('/chat')
  }

  return { messages: data as Message[] }
}

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/chat')
  return { success: true }
} 