import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/TTSListView.vue'
import TTSAdminView from '@/views/AdminPanelView.vue'
import TTSPlay from '@/views/TTSPlayView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/admin',
      name: 'admin',
      component: TTSAdminView,
    },
    {
      path: '/TTS/:id',
      name: 'TTSPlay',
      component: TTSPlay,
    }
  ],
})

export default router
