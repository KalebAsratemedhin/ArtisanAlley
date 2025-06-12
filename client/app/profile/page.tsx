import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { ProfileHeader } from './components/ProfileHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { FollowersTab } from './components/FollowersTab'
import { FollowingTab } from './components/FollowingTab'
import { getFollowCounts } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    // Continue with empty profile rather than failing
  }

  // Get follow counts
  const { followers, following } = await getFollowCounts(user.id)

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <div className="space-y-8">
        {/* Profile Header with Edit */}
        <ProfileHeader 
          user={user} 
          profile={{
            name: profile?.name || null,
            email: profile?.email || null,
            avatar_url: profile?.avatar_url || null,
          }}
          followCounts={{
            followers,
            following
          }}
        />

        {/* Tabs */}
        <Tabs defaultValue="followers" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="followers">
                Followers ({followers})
              </TabsTrigger>
              <TabsTrigger value="following">
                Following ({following})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="followers">
            <FollowersTab userId={user.id} />
          </TabsContent>

          <TabsContent value="following">
            <FollowingTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  )
}
