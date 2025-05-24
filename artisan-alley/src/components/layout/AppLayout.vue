<template>
    <div class="flex flex-col min-h-screen relative ">
      <AppHeader />
      <main class="flex-grow">
        <slot />
      </main>
      <AppFooter />
    </div>
  </template>
  
  <script setup lang="ts">
  import AppHeader from './AppHeader.vue'
  import AppFooter from './AppFooter.vue'
  </script>
  