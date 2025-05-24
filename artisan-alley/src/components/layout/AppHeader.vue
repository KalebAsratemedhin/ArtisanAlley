<template>
  <header
    class="w-full bg-white text-black border-b border-muted px-6 py-4 sticky top-0 z-50"
  >
    <div class="flex justify-between items-center max-w-7xl mx-auto">
      <!-- Logo -->
      <RouterLink to="/" class="text-xl font-bold">ArtisanAlley</RouterLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-4">
        <RouterLink to="/discover" :class="linkClass('/discover')">
          <Search class="w-4 h-4 mr-1" /> Discover
        </RouterLink>

        <template v-if="session">
          <RouterLink to="/purchases" :class="linkClass('/purchases')">
            <ShoppingCart class="w-4 h-4 mr-1" /> Purchases
          </RouterLink>
          <RouterLink to="/gallery" :class="linkClass('/bookmarks', true)">
            <GalleryThumbnails class="w-4 h-4 mr-2" /> Gallery
          </RouterLink>

          <!-- Avatar + Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <img
                :src="
                  session.user?.user_metadata?.avatar_url ||
                  `https://i.pravatar.cc/40`
                "
                class="w-8 h-8 rounded-full cursor-pointer"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-48">
              <DropdownMenuItem @click="goTo('/profile')">
                <User class="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem @click="goTo('/settings')">
                <Settings class="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem @click="logout">
                <LogOut class="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>

        <template v-else>
          <RouterLink to="/signin" :class="linkClass('/signin')">
            <LogIn class="w-4 h-4 mr-1" /> Sign In
          </RouterLink>
          <RouterLink to="/signup" :class="linkClass('/signup')">
            <UserPlus class="w-4 h-4 mr-1" /> Sign Up
          </RouterLink>
        </template>
      </nav>

      <!-- Mobile: Hamburger -->
      <Sheet>
        <SheetTrigger class="md:hidden">
          <Menu class="w-6 h-6" />
        </SheetTrigger>
        <SheetContent side="left">
          <div class="p-4 space-y-4">
            <RouterLink to="/discover" :class="linkClass('/discover', true)">
              <Search class="w-4 h-4 mr-2" /> Discover
            </RouterLink>

            <template v-if="session">
              <RouterLink
                to="/purchases"
                :class="linkClass('/purchases', true)"
              >
                <ShoppingCart class="w-4 h-4 mr-2" /> Purchases
              </RouterLink>
              <RouterLink to="/profile" :class="linkClass('/bookmarks', true)">
                <User class="w-4 h-4 mr-2" /> Profile
              </RouterLink>
              <RouterLink to="/settings" :class="linkClass('/bookmarks', true)">
                <Settings class="w-4 h-4 mr-2" /> Settings
              </RouterLink>
              <RouterLink to="/gallery" :class="linkClass('/bookmarks', true)">
                <GalleryThumbnails class="w-4 h-4 mr-2" /> Gallery
              </RouterLink>

              <button @click="logout" class="flex items-center gap-2">
                <LogOut class="w-4 h-4" /> Logout
              </button>
            </template>

            <template v-else>
              <RouterLink to="/signin" :class="linkClass('/signin', true)">
                <LogIn class="w-4 h-4 mr-2" /> Sign In
              </RouterLink>
              <RouterLink to="/signup" :class="linkClass('/signup', true)">
                <UserPlus class="w-4 h-4 mr-2" /> Sign Up
              </RouterLink>
            </template>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { supabase } from "@/lib/supabase";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

import {
  Menu,
  Search,
  ShoppingCart,
  Bookmark,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  GalleryThumbnails,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const session = ref<any>(null);

const linkClass = (path: string, isMobile = false) => {
  const isActive = route.path === path;
  return [
    "flex items-center px-3 py-2 rounded-md font-medium text-sm transition-colors",
    isMobile ? "w-full" : "",
    isActive ? "bg-black text-white" : "hover:bg-black hover:text-white",
  ].join(" ");
};

function goTo(path: string) {
  router.push(path);
}

async function logout() {
  await supabase.auth.signOut();
  session.value = null;
  router.push("/");
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
  
});
</script>
