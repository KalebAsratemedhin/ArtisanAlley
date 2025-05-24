<template>
  <div class="w-full">
    <!-- Filters -->
    <section class="bg-white py-6 px-6 md:px-16 border-b">
      <div class="flex flex-wrap gap-4 items-center">
        <Select v-model="selectedCategory">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedYear">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="year in years" :key="year" :value="year">
              {{ year }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedPrice">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="price in priceRanges" :key="price" :value="price">
              {{ price }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>

    <div class="md:flex justify-between">
      <!-- Artworks -->
      <section class="bg-white flex-grow-1 text-black py-10 px-6 md:px-16 space-y-12">
        <div
          v-for="(artList, category) in groupedArtworks"
          :key="category"
          class="space-y-4"
        >
          <h2 class="text-2xl font-bold">{{ category }}</h2>
          <Carousel>
            <CarouselContent>
              <CarouselItem
                v-for="art in filteredArtworks(artList)"
                :key="art.id"
                class="sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3"
              >
                <router-link :to="`/art-details/${art.id}`" class="block">
                  <Card class="rounded-xl overflow-hidden hover:shadow-lg transition">
                    <img
                      :src="art.images[0]"
                      :alt="art.title"
                      class="w-full h-60 object-cover"
                    />
                    <CardContent class="p-4">
                      <h3 class="text-lg font-semibold">{{ art.title }}</h3>
                      <p class="text-sm text-muted-foreground">
                        {{ new Date(art.created_at).getFullYear() }} · ${{ art.price }}
                      </p>
                      <p class="text-sm mt-1 text-gray-600">
                        👍 {{ art.likeCount }} &nbsp; 👎 {{ art.dislikeCount }}
                      </p>
                    </CardContent>
                  </Card>
                </router-link>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious class="ml-6" />
            <CarouselNext class="mr-6" />
          </Carousel>
        </div>
      </section>

      <!-- Artists -->
      <section class="bg-white flex-grow-1 text-black md:px-1 py-10">
        <aside class="w-full pl-8">
          <h3 class="text-xl font-bold mb-4">Artists You May Like</h3>
          <ul class="space-y-4">
            <li
              v-for="artist in suggestedArtists"
              :key="artist.id"
              class="flex items-center gap-3"
            >
              <img
                :src="artist.avatar"
                alt="Artist Avatar"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p class="font-semibold">{{ artist.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ artist.style }}
                </p>
              </div>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";

// Filters
const selectedCategory = ref<string | undefined>();
const selectedYear = ref<string | undefined>();
const selectedPrice = ref<string | undefined>();

const categories = ["painting", "digital", "sculpture", "photography"];
const years = ["2025", "2024", "2023"];
const priceRanges = ["<50", "50-100", "100-200", "200+"];

// Artwork data
const artworks = ref<any[]>([]);

async function fetchArtworks() {
  const { data, error } = await supabase
    .from("ArtPiece")
    .select(`*, Reaction(type)`); // ArtPiece.*, related reactions

  if (error) {
    console.error("Error fetching artworks:", error);
    return;
  }

  // Count likes/dislikes from reactions
  artworks.value = data.map((art) => {
    const likeCount = art.Reaction?.filter((r: any) => r.type === "like").length || 0;
    const dislikeCount = art.Reaction?.filter((r: any) => r.type === "dislike").length || 0;
    return {
      ...art,
      likeCount,
      dislikeCount,
    };
  });
}

onMounted(fetchArtworks);

// Group artworks by category
const groupedArtworks = computed(() => {
  const groups: Record<string, typeof artworks.value> = {};
  for (const art of artworks.value) {
    if (!groups[art.category]) groups[art.category] = [];
    groups[art.category].push(art);
  }
  return groups;
});

// Filter function
function filteredArtworks(list: typeof artworks.value) {
  return list.filter((art) => {
    if (selectedCategory.value && art.category !== selectedCategory.value) return false;
    if (selectedYear.value) {
      const year = new Date(art.created_at).getFullYear().toString();
      if (year !== selectedYear.value) return false;
    }
    if (selectedPrice.value) {
      const price = art.price;
      const range = selectedPrice.value;
      if (
        (range === "<50" && price >= 50) ||
        (range === "50-100" && (price < 50 || price > 100)) ||
        (range === "100-200" && (price < 100 || price > 200)) ||
        (range === "200+" && price <= 200)
      )
        return false;
    }
    return true;
  });
}

// Suggested artists
const suggestedArtists = [
  {
    id: 1,
    name: "Lina Vasquez",
    avatar: "https://i.pravatar.cc/50?img=1",
    style: "Impressionism",
  },
  {
    id: 2,
    name: "Jorge Minh",
    avatar: "https://i.pravatar.cc/50?img=2",
    style: "Surrealism",
  },
  {
    id: 3,
    name: "Rina Okabe",
    avatar: "https://i.pravatar.cc/50?img=3",
    style: "Abstract",
  },
  {
    id: 4,
    name: "Samuel Lee",
    avatar: "https://i.pravatar.cc/50?img=4",
    style: "Modern Art",
  },
];
</script>
