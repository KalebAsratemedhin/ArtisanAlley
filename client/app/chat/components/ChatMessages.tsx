'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Message } from '../actions'
import { getMessages, sendMessage } from '../actions'

interface ChatMessagesProps {
  userId: string
}

export function ChatMessages({ userId }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Initial messages load
    const loadMessages = async () => {
      const { messages, error } = await getMessages(userId)
      if (error) {
        console.error('Error loading messages:', error)
        return
      }
      if (messages) {
        setMessages(messages)
        scrollToBottom()
      }
    }

    loadMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId},receiver_id=eq.${userId}`,
        },
        async (payload) => {
          // Reload messages when there's a change
          const { messages } = await getMessages(userId)
          if (messages) {
            setMessages(messages)
            scrollToBottom()
            router.refresh() // Refresh the page to update unread counts
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    const { error } = await sendMessage(userId, newMessage.trim())
    setIsLoading(false)

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${
              message.sender_id === userId ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <Avatar className="flex-shrink-0">
              <AvatarImage src={message.sender.avatar_url} />
              <AvatarFallback>
                {message.sender.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 