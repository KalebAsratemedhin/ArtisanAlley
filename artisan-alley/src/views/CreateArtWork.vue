<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { createArtPiece } from '@/services/artworkService'
import { toast, Toaster } from 'vue-sonner'

const title = ref('')
const description = ref('')
const price = ref(0)
const category = ref('')
const imageFiles = ref<File[]>([])
const previews = ref<string[]>([])

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    imageFiles.value = Array.from(target.files)
    previews.value = imageFiles.value.map((file) => URL.createObjectURL(file))
  }
}


async function handleSubmit() {
  if (!title.value || !category.value || imageFiles.value.length === 0) {
    alert('Please fill all required fields.')
    return
  }

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    toast.error('You must be logged in.')
    return
  }

  try {
    await createArtPiece(user.id, {
      title: title.value,
      description: description.value,
      price: price.value,
      category: category.value,
      images: imageFiles.value,
    })
    
    toast.success('Artwork created successfully!')
    
    // router.push('/gallery') or reset form
  } catch (err: any) {
    toast.error(err.message)
  }
}

</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <h1 class="text-2xl font-bold">Add New Artwork</h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <Input v-model="title" placeholder="Title" />

      <Textarea v-model="description" placeholder="Description" rows="4" />

      <Input v-model="price" placeholder="Price (USD)" type="number" />

      <Select v-model="category">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="painting">Painting</SelectItem>
          <SelectItem value="digital">Digital</SelectItem>
          <SelectItem value="sculpture">Sculpture</SelectItem>
          <SelectItem value="photography">Photography</SelectItem>
        </SelectContent>
      </Select>

      <!-- Image Upload Box -->
      <div
        class="w-full border border-dashed border-gray-400 rounded-md p-6 text-center space-y-2"
      >
        <label class="block text-sm font-medium text-gray-700">
          Upload Images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          @change="handleFileChange"
          id="imageUploader"
        />

        <label for="imageUploader" class="inline-block">
          <Button for="imageUploader" type="button" variant="outline">Choose Images</Button>
        </label>

        <div
          class="grid grid-cols-3 gap-2 mt-4"
          v-if="previews.length"
        >
          <img
            v-for="(src, i) in previews"
            :key="i"
            :src="src"
            class="w-full h-24 object-cover rounded-md"
          />
        </div>
      </div>

      <Button type="submit">Submit</Button>
    </form>
  </div>
  <Toaster />

</template>
