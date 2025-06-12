import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { SecurityForm } from '@/app/profile/components/SecurityForm'
import { Toaster } from '@/components/ui/sonner'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Security Settings</h1>
      <SecurityForm email={user.email || ''} />
      <Toaster />
    </div>
  )
} 