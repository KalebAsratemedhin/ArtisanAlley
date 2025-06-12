'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateEmail, updatePassword } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SecurityFormProps {
  email: string
}

export function SecurityForm({ email }: SecurityFormProps) {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)

    try {
      const form = new FormData()
      form.append('email', newEmail)

      const result = await updateEmail(form)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        setNewEmail('')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsPasswordLoading(true)

    try {
      const form = new FormData()
      form.append('password', newPassword)

      const result = await updatePassword(form)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Email
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium mb-1">
                New Email
              </label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                required
              />
            </div>
            <Button type="submit" disabled={isEmailLoading}>
              {isEmailLoading ? 'Updating...' : 'Update Email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 