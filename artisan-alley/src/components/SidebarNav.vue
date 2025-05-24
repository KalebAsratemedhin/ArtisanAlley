<template>
    <nav class="space-y-1">
      <Button
        v-for="item in items"
        :key="item.value"
        variant="ghost"
        :class="{ 'bg-accent text-accent-foreground': selected === item.value }"
        class="w-full justify-start"
        @click="$emit('select', item.value)"
      >
        <component :is="item.icon" class="h-4 w-4 mr-2" />
        {{ item.label }}
      </Button>
    </nav>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    items: { label: string; value: string; icon: any }[]
    selected: string
  }>()
  defineEmits(['select'])
  </script>
  