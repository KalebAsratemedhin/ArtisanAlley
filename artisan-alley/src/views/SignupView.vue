<template>
  <div class="min-h-screen flex items-center justify-center w-full bg-muted px-4">
    <Card class="w-full max-w-md shadow-xl rounded-2xl border border-border bg-background">
      <CardHeader class="text-center space-y-1">
        <CardTitle class="text-3xl font-semibold tracking-tight">Create your account</CardTitle>
        <p class="text-muted-foreground text-sm">Join us and showcase your artisan work</p>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSignUp" class="grid gap-4">
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
            <label for="displayName" class="block text-sm font-medium mb-1">Name</label>
            <Input
              id="displayName"
              v-model="displayName"
              placeholder="name"
              type="text"
              required
              class="bg-background"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              v-model="password"
              placeholder="Choose a password"
              type="password"
              required
              class="bg-background"
            />
          </div>

          <Button type="submit" :disabled="loading" class="w-full">
            {{ loading ? 'Creating...' : 'Create Account' }}
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
          Sign Up with Google
        </Button>

        <p class="text-sm text-center mt-6 text-muted-foreground">
          Already have an account?
          <RouterLink to="/signin" class="text-primary font-medium hover:underline ml-1">
            Sign in
          </RouterLink>
        </p>
      </CardContent>
    </Card>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Toaster } from '@/components/ui/sonner'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const displayName = ref('')
const loading = ref(false)

const handleSignUp = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: displayName.value, // add your custom field here
        },
      },
    })


    if (error) throw error

    toast.success('Account created! Check your email to confirm.')
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
    // Supabase handles the redirect to Google
  } catch (err: any) {
    toast.error(err.message)
  }
}
</script>
