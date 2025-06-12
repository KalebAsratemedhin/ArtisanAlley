import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { getChatParticipants } from './actions'
import { ChatList } from './components/ChatList'
import { ChatMessages } from './components/ChatMessages'
import { UserSearch } from './components/UserSearch'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const { participants, error } = await getChatParticipants()
  if (error) {
    console.error('Error fetching chat participants:', error)
  }

  const selectedUserId = searchParams.userId

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6 bg-card rounded-lg shadow-lg overflow-hidden min-h-[600px]">
        {/* Chat List */}
        <div className="col-span-4 border-r">
          <div className="p-4 border-b">
            <UserSearch />
          </div>
          <ChatList 
            participants={participants || []} 
            selectedUserId={selectedUserId}
          />
        </div>

        {/* Chat Messages */}
        <div className="col-span-8">
          {selectedUserId ? (
            <ChatMessages userId={selectedUserId} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 