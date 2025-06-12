'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfile } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ProfileFormProps {
  initialData?: {
    full_name?: string
    username?: string
    website?: string
    avatar_url?: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: initialData?.full_name || '',
    username: initialData?.username || '',
    website: initialData?.website || '',
    avatarUrl: initialData?.avatar_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value)
      })

      const result = await updateProfile(form)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="johndoe"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-1">
              Website
            </label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">
              Avatar URL
            </label>
            <Input
              id="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 