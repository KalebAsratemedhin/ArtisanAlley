<template>
  <div class="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6" v-if="art">
    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <ArtCarousel :images="art.images" />

      <!-- Title -->
      <h1 class="text-2xl font-bold">{{ art.title }}</h1>

      <!-- Creator actions -->
      <div class="flex items-center gap-4">
        <!-- Like -->
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            :disabled="art?.value?.user_id === user.value?.id"
            :class="{ 'text-blue-500': userReaction === 'like' }"
            @click="handleReaction('like')"
          >
            <ThumbsUpIcon class="w-5 h-5" />
          </Button>
          <span class="text-sm">{{ likeCount }}</span>
        </div>

        <!-- Dislike -->
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            :disabled="art?.value?.user_id === user.value?.id"
            :class="{ 'text-red-500': userReaction === 'dislike' }"
            @click="handleReaction('dislike')"
          >
            <ThumbsDownIcon class="w-5 h-5" />
          </Button>
          <span class="text-sm">{{ dislikeCount }}</span>
        </div>

        <Button variant="secondary" class="flex items-center gap-2">
          <Plus class="w-4 h-4 text-blue-950" />
          Follow {{ art.creator?.name || "Artist" }}
        </Button>
      </div>

      <!-- Description -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Description</h3>
        <p class="text-sm text-muted-foreground">{{ art.description }}</p>
      </div>

      <!-- Comments -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Comments</h3>
        <div class="space-y-4">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="p-4 bg-muted rounded-md flex gap-4"
          >
            <img
              :src="comment.avatar_url"
              class="w-10 h-10 rounded-full object-cover"
              alt="Avatar"
            />
            <div class="flex-1 space-y-1">
              <div class="flex justify-between items-center">
                <p class="text-sm font-medium">{{ comment.name }}</p>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ comment.comment }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <Button variant="ghost" size="icon">
                  <ThumbsUpIcon class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ThumbsDownIcon class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" class="text-xs px-2 py-0 h-6">
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
        <form v-if="art.value?.user_id !== user.value?.id" @submit.prevent="addComment" class="mt-4 flex items-center gap-2">
          <Input v-model="newComment" placeholder="Add a comment..." />
          <Button size="sm" type="submit">Post</Button>
        </form>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Same Artist -->
      <div>
        <h4 class="font-semibold mb-2">
          More by {{ art.creator?.name || "Artist" }}
        </h4>
        <RouterLink
          v-for="a in sameArtistWorks"
          :key="a.id"
          :to="`/art-details/${a.id}`"
          class="rounded overflow-hidden shadow-md block hover:shadow-lg transition"
        >
          <img
            :src="a.images[0]"
            :alt="a.title"
            class="w-full h-48 object-cover bg-gray-100"
          />
          <div class="p-2 text-sm font-medium truncate">
            {{ a.title }}
          </div>
        </RouterLink>
      </div>

      <!-- Same Category -->
      <div>
        <h4 class="font-semibold mb-2">More in {{ art.category }}</h4>
        <RouterLink
          v-for="a in sameCategoryWorks"
          :key="a.id"
          :to="`/art-details/${a.id}`"
          class="rounded overflow-hidden shadow-md block hover:shadow-lg transition"
        >
          <img
            :src="a.images[0]"
            :alt="a.title"
            class="w-full h-48 object-cover bg-gray-100"
          />
          <div class="p-2 text-sm font-medium truncate">
            {{ a.title }}
          </div>
        </RouterLink>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-10 text-gray-500">Loading artwork...</div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArtCarousel from "@/components/Carousel.vue";
import { Plus, ThumbsDownIcon, ThumbsUpIcon } from "lucide-vue-next";
import { toast } from "vue-sonner";

const route = useRoute();

const art = ref<any>(null);
const sameArtistWorks = ref<any[]>([]);
const sameCategoryWorks = ref<any[]>([]);
const comments = ref<any[]>([]);
const newComment = ref("");

const likeCount = ref(0);
const dislikeCount = ref(0);
const userReaction = ref<string | null>(null);
const user = ref<any>(null);

const fetchCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
};

const fetchArt = async () => {
  const { data, error } = await supabase
    .from("ArtPiece")
    .select(
      `
      id,
      title,
      description,
      images,
      category,
      user_id,
      Reaction(type, user_id),
      Comment(*)
      `
    )
    .eq("id", route.params.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  art.value = data;

  // Extract reactions
  const allReactions = data.Reaction || [];
  likeCount.value = allReactions.filter((r: any) => r.type === "like").length;
  dislikeCount.value = allReactions.filter((r: any) => r.type === "dislike").length;

  userReaction.value =
    allReactions.find((r: any) => r.user_id === user.value?.id)?.type || null;

  // Extract comments
  comments.value = data.Comment || [];

  // Fetch sidebar
  const [sameArtist, sameCategory] = await Promise.all([
    supabase
      .from("ArtPiece")
      .select("images, title, id")
      .eq("user_id", data.user_id)
      .neq("id", data.id)
      .limit(4),
    supabase
      .from("ArtPiece")
      .select("images, title, id")
      .eq("category", data.category)
      .neq("id", data.id)
      .limit(4),
  ]);

  sameArtistWorks.value = sameArtist.data || [];
  sameCategoryWorks.value = sameCategory.data || [];
};

const handleReaction = async (type: "like" | "dislike") => {
  if (!user.value || !art.value?.id) return;

  await supabase
    .from("Reaction")
    .upsert(
      [
        {
          art_piece_id: art.value.id,
          user_id: user.value.id,
          type,
        },
      ],
      { onConflict: "art_piece_id, user_id" }
    );

  userReaction.value = type;

  // Update reaction counts manually
  if (type === "like") {
    likeCount.value += userReaction.value === "dislike" ? 1 : 0;
    dislikeCount.value -= userReaction.value === "dislike" ? 1 : 0;
  } else {
    dislikeCount.value += userReaction.value === "like" ? 1 : 0;
    likeCount.value -= userReaction.value === "like" ? 1 : 0;
  }

  await fetchArt(); // re-fetch to stay consistent
};

const addComment = async () => {
  if (art.value.user_id === user.value?.id) {
    toast.error("You cannot comment on your own artwork");
    return;
  }

  if (!newComment.value.trim() || !user.value || !art.value?.id) return;

  const { error } = await supabase.from("Comment").insert([
    {
      art_piece_id: art.value.id,
      user_id: user.value.id,
      comment: newComment.value,
      avatar_url: user.value.user_metadata.avatar_url,
      name: user.value.user_metadata.name,
    },
  ]);

  if (!error) {
    newComment.value = "";
    await fetchArt(); // refresh to get updated comments
  }
};

onMounted(async () => {
  await fetchCurrentUser();
  await fetchArt();
});
</script>
