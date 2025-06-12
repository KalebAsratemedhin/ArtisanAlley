'use client'

import { useState, useTransition } from 'react'
import { login, signup, signInWithGoogle } from './actions'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
  }

  const handleLogin = (formData: FormData) => {
    startTransition(async () => {
      try {
        await login(formData)
        toast.success('Logged in successfully')
        resetForm()
      } catch (err: any) {
        toast.error(err.message || 'Login failed')
      }
    })
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      const { error, url } = await signInWithGoogle()
      if (error) {
        toast.error(error)
        return
      }
      if (url) {
        window.location.href = url
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSignupForm = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await signup(formData)
        if (result?.error) {
          toast.error(result.error)
        } else if (result?.success) {
          toast.success(result.success)
        }
        resetForm()
      } catch (err: any) {
        toast.error(err.message || 'Signup failed')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-border bg-background p-6">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-semibold">
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {tab === 'login'
              ? 'Login to manage your profile and services'
              : 'Sign up to get started'}
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-2 w-2/3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Signup</TabsTrigger>
              </TabsList>
            </div>

            {/* Social Login */}
            <div className="space-y-4 mb-6">
              <Button 
                variant="outline" 
                type="button"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Login Form */}
            <TabsContent value="login">
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData()
                  formData.append('email', email)
                  formData.append('password', password)
                  handleLogin(formData)
                }}
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup">
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData()
                  formData.append('email', email)
                  formData.append('password', password)
                  handleSignupForm(formData)
                }}
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    className="bg-background"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
