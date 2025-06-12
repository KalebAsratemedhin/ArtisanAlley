import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChatParticipant } from '../actions'

interface ChatListProps {
  participants: ChatParticipant[]
  selectedUserId?: string
}

export function ChatList({ participants, selectedUserId }: ChatListProps) {
  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>
      <div className="divide-y">
        {participants.map((participant) => (
          <Link
            key={participant.participant_id}
            href={`/chat?userId=${participant.participant_id}`}
            className={`block p-4 hover:bg-accent transition-colors ${
              selectedUserId === participant.participant_id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={participant.participant_avatar} />
                <AvatarFallback>
                  {participant.participant_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {participant.participant_name}
                  </p>
                  {participant.last_message_time && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(participant.last_message_time).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {participant.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {participant.last_message}
                  </p>
                )}
                {participant.unread_count > 0 && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      {participant.unread_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
        {participants.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No messages yet
          </div>
        )}
      </div>
    </div>
  )
} 