<template>
  <footer class="w-full bg-black text-white border-t border-white px-6 py-8">
    <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
      <!-- App Title -->
      <div class="space-y-2">
        <h2 class="text-lg font-bold">ArtisanAlley</h2>
        <p class="text-muted-foreground">Where creativity meets collectors.</p>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="text-sm font-semibold uppercase mb-2 text-muted-foreground">Quick Links</h3>
        <ul class="space-y-1">
          <li><RouterLink to="/discover" class="hover:underline">Discover</RouterLink></li>
          <li><RouterLink to="/purchases" class="hover:underline">Purchases</RouterLink></li>
          <li><RouterLink to="/bookmarks" class="hover:underline">Bookmarks</RouterLink></li>
          <li><RouterLink to="/signin" class="hover:underline">Sign In</RouterLink></li>
          <li><RouterLink to="/signup" class="hover:underline">Sign Up</RouterLink></li>
        </ul>
      </div>

      <!-- Social Links -->
      <div>
        <h3 class="text-sm font-semibold uppercase mb-2 text-muted-foreground">Follow Us</h3>
        <div class="flex gap-4">
          <a href="https://twitter.com" target="_blank" aria-label="Twitter" class="hover:text-muted-foreground">
            <Twitter class="w-5 h-5" />
          </a>
          <a href="https://instagram.com" target="_blank" aria-label="Instagram" class="hover:text-muted-foreground">
            <Instagram class="w-5 h-5" />
          </a>
          <a href="https://github.com" target="_blank" aria-label="GitHub" class="hover:text-muted-foreground">
            <Github class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom note -->
    <div class="text-center mt-8 text-xs text-muted-foreground border-t border-white pt-4">
      &copy; {{ new Date().getFullYear() }} ArtisanHub. All rights reserved.
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Twitter, Instagram, Github } from 'lucide-vue-next'
</script>
