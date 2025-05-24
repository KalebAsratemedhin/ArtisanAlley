<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { RouterLink } from 'vue-router'

const artworks = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData.session) {
    console.error('User not authenticated')
    loading.value = false
    return
  }

  const userId = sessionData.session.user.id

  
  const { data, error } = await supabase
  .from('ArtPiece')
  .select('id, title, images')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  
  console.log("user id", data)
  if (error) {
    console.error('Error fetching artworks:', error)
  } else {
    artworks.value = data.map((art: any) => ({
      id: art.id,
      title: art.title,
      image: art.images?.[0] || '', // assumes images is an array
    }))
  } 

  loading.value = false
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">My Gallery</h1>
      <RouterLink
        to="/create"
        class="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900"
      >
        + Add New
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center text-gray-500">Loading artworks...</div>
    <div v-else-if="artworks.length === 0" class="text-center text-gray-500">
      No artworks found.
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
  <RouterLink
    v-for="art in artworks"
    :key="art.id"
    :to="`/art-details/${art.id}`"
    class="rounded overflow-hidden shadow-md block hover:shadow-lg transition"
  >
    <img
      :src="art.image"
      :alt="art.title"
      class="w-full h-48 object-cover bg-gray-100"
    />
    <div class="p-2 text-sm font-medium truncate">
      {{ art.title }}
    </div>
  </RouterLink>
</div>

  </div>
</template>
