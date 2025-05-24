<script setup lang="ts">
import { watchOnce } from '@vueuse/core'
import { ref } from 'vue'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps<{
  images: string[]
}>()

const emblaMainApi = ref<CarouselApi>()
const emblaThumbnailApi = ref<CarouselApi>()
const selectedIndex = ref(0)

function onSelect() {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) return
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  emblaThumbnailApi.value.scrollTo(selectedIndex.value)
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value) return
  emblaMainApi.value.scrollTo(index)
}

watchOnce(emblaMainApi, (api) => {
  if (!api) return
  onSelect()
  api.on('select', onSelect)
  api.on('reInit', onSelect)
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Main Carousel -->
    <Carousel class="relative w-full h-full" @init-api="val => emblaMainApi = val">
      <CarouselContent>
        <CarouselItem
          v-for="(image, index) in images"
          :key="index"
        >
          <div class="p-1">
            <Card class="py-0">
              <CardContent class="flex aspect-square items-center justify-center p-0">
                <img :src="image" class="w-full h-full object-cover rounded-md" />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious class="ml-8" />
      <CarouselNext class="mr-8" />
    </Carousel>

    <!-- Thumbnail Carousel -->
    <Carousel class="relative w-full min-h-full" @init-api="val => emblaThumbnailApi = val">
      <CarouselContent class="flex gap-2 ml-0">
        <CarouselItem
          v-for="(image, index) in images"
          :key="index"
          class="pl-0 basis-1/4 cursor-pointer"
          @click="onThumbClick(index)"
        >
          <div :class="index === selectedIndex ? 'opacity-100  rounded-md' : 'opacity-50'">
            <Card class="py-0">
              <CardContent class=" bg-red-400 flex aspect-square items-center justify-center p-0">
                <img :src="image" class="w-full h-full object-cover rounded-md" />
              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>
</template>
