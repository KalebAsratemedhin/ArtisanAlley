import { createClient } from '@/lib/supabaseServer'
import { ProfileHeader } from '../components/ProfileHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { FollowersTab } from '../components/FollowersTab'
import { FollowingTab } from '../components/FollowingTab'
import { GalleryTab } from '../components/GalleryTab'
import { getFollowCounts } from '../actions'
import { notFound } from 'next/navigation'

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get follow counts
  const { followers, following } = await getFollowCounts(params.id)

  const isOwnProfile = currentUser?.id === params.id

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <div className="space-y-8">
        {/* Profile Header */}
        <ProfileHeader 
          user={{ id: params.id } as any}
          profile={{
            name: profile.name,
            email: profile.email,
            avatar_url: profile.avatar_url,
          }}
          followCounts={{
            followers,
            following
          }}
          isOwnProfile={isOwnProfile}
        />

        {/* Tabs */}
        <Tabs defaultValue="gallery" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="gallery">
                Gallery
              </TabsTrigger>
              <TabsTrigger value="followers">
                Followers ({followers})
              </TabsTrigger>
              <TabsTrigger value="following">
                Following ({following})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gallery">
            <GalleryTab userId={params.id} />
          </TabsContent>

          <TabsContent value="followers">
            <FollowersTab userId={params.id} />
          </TabsContent>

          <TabsContent value="following">
            <FollowingTab userId={params.id} />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </div>
  )
} 