import { createRouter, createWebHistory } from 'vue-router'
import SigninView from '@/views/SigninView.vue'
import SignupView from '@/views/SignupView.vue'
import Landing from '@/views/Landing.vue'
import Discover from '@/views/Discover.vue'
import Profile from '@/views/Profile.vue'
import ArtDetails from '@/views/ArtDetails.vue'
import CreateArtWork from '@/views/CreateArtWork.vue'
import Gallery from "@/views/Gallery.vue"

const routes = [
  { path: '/', name: 'Home', component: Landing },
  { path: '/discover', name: 'Discover', component: Discover },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/art-details/:id', name: 'ArtDetails', component: ArtDetails },
  { path: '/create', name: 'Create', component: CreateArtWork },
  { path: '/gallery', name: 'Gallery', component: Gallery },
  { path: '/signup', name: 'SignUp', component: SignupView },
  { path: '/signin', name: 'SignIn', component: SigninView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('auth_token')
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/signin')
  } else {
    next()
  }
})

export default router
