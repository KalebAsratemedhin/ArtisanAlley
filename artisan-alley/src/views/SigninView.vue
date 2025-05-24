<template>
  <div class="min-h-screen flex items-center justify-center bg-muted px-4">
    <Card class="w-full max-w-md shadow-xl rounded-2xl border border-border bg-background">
      <CardHeader class="text-center space-y-1">
        <CardTitle class="text-3xl font-semibold tracking-tight">Welcome Back</CardTitle>
        <p class="text-sm text-muted-foreground">Login to manage your profile and services</p>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSignIn" class="grid gap-4">
          <div>
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              v-model="email"
              placeholder="you@example.com"
              type="email"
              required
              class="bg-background"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              v-model="password"
              placeholder="Enter your password"
              type="password"
              required
              class="bg-background"
            />
          </div>

          <Button type="submit" :disabled="loading" class="w-full">
            {{ loading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>

        <div class="flex items-center my-6">
          <hr class="flex-grow border-muted" />
          <span class="mx-2 text-muted-foreground text-sm">or</span>
          <hr class="flex-grow border-muted" />
        </div>

        <Button
          variant="outline"
          class="w-full flex items-center justify-center gap-2"
          @click="handleGoogle"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            class="h-5 w-5"
          />
          Continue with Google
        </Button>

        <p class="text-sm text-center mt-6 text-muted-foreground">
          Don't have an account?
          <RouterLink to="/signup" class="text-primary font-medium hover:underline ml-1">
            Sign up
          </RouterLink>
        </p>
      </CardContent>
    </Card>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'
import { supabase } from '@/lib/supabase' // your Supabase client instance

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSignIn = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    toast.success('Logged in successfully')
    router.push('/profile')
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

const handleGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) throw error
  } catch (err: any) {
    toast.error(err.message)
  }
}
</script>
