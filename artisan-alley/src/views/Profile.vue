<template>
  <div class="max-w-4xl mx-auto px-4 py-6">

    <div class="relative flex  items-center gap-4 mb-6">
      <!-- Avatar -->
      <div class="flex flex-col">
        <div class="relative">
         
        <Avatar class="h-20 w-20">
          <AvatarImage v-if="previewUrl" :src="previewUrl" />
          <AvatarImage v-if="user?.user_metadata?.avatar_url"
            :src="user?.user_metadata?.avatar_url "
          />
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>

        <!-- Edit Icon/Button -->
        <label
          for="avatar-upload"
          class="absolute bottom-0 right-0 bg-white rounded-full shadow p-1 cursor-pointer border hover:bg-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536M9 13h3l7-7a2.121 2.121 0 10-3-3l-7 7v3z"
            />
          </svg>
        </label>
        <input
          id="avatar-upload"
          type="file"
          class="hidden"
          @change="onFileSelected"
          accept="image/*"
        />
      </div>
      <!-- Submit Button -->
      <div v-if="previewUrl" class="mt-2 block">
        <button
          class="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90"
          @click="submitImageUpload"
        >
          Submit
        </button>
      </div>
      </div>

      <div>
        <h2 class="text-xl font-semibold">
          {{ user?.user_metadata?.name }}
        </h2>
        <p class="text-muted-foreground">{{ user?.email }}</p>
      </div>
    </div>

    <!-- Tabs remain unchanged -->
    <Tabs v-model="selectedTab" class="w-full mt-6">
      <TabsList class="overflow-x-auto no-scrollbar w-full">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{
          tab.label
        }}</TabsTrigger>
      </TabsList>

      <TabsContent value="followers"><FollowersSection /></TabsContent>
      <TabsContent value="followings"><FollowingsSection /></TabsContent>
      <TabsContent value="bookmarks"><BookmarksSection /></TabsContent>
    </Tabs>
  </div>
  <Toaster/>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FollowersSection from "@/components/profile/FollowersSection.vue";
import FollowingsSection from "@/components/profile/FollowingsSection.vue";
import BookmarksSection from "@/components/profile/BookmarksSection.vue";
import { toast } from "vue-sonner";
import { Toaster } from "vue-sonner";


const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const onFileSelected = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')         // replace spaces with underscores
    .replace(/[^\w.-]/g, '');     // remove non-url-safe characters
}

const submitImageUpload = async () => {
  if (!selectedFile.value || !user.value) return;

  const file = selectedFile.value;
  const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
  const filePath = `avatars/${user.value.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('pictures')
    .upload(filePath, file);

  if (uploadError) {
    toast.error("Upload failed");
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from('pictures')
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  const { data: updateUser, error: updateError } = await supabase.auth.updateUser({
    data: {
      avatar_url: avatarUrl,
    },
  });

  if (updateError) {
    toast.error("Failed to update profile picture");
    return;
  }

  toast.success("Profile picture updated");
  previewUrl.value = null;
  selectedFile.value = null;

  user.value = updateUser?.user ?? user.value;
};

const user = ref<User | null>(null);
const selectedTab = ref("followers");

const tabs = [
  { label: "Followers", value: "followers" },
  { label: "Followings", value: "followings" },
  { label: "Bookmarks", value: "bookmarks" },
];

const initials = computed(
  () =>
    user.value?.user_metadata.name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || ""
);

onMounted(() => {
  supabase.auth.getUser().then(({ data }) => {
    user.value = data.user;
  });

  
  
})

</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
