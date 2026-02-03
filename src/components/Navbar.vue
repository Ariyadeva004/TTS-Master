<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isOpen = ref(false)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Admin Panel', path: '/admin' } // Ensure you have this route defined
]

const isActive = (path) => route.path === path
</script>

<template>
  <nav class="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        
        <!-- Logo / Brand -->
        <div class="flex-shrink-0 flex items-center gap-2 cursor-pointer" @click="$router.push('/')">
          <!-- Simple Grid Icon -->
          <div class="grid grid-cols-2 gap-0.5 w-6 h-6">
            <div class="bg-green-400 rounded-sm"></div>
            <div class="bg-white rounded-sm"></div>
            <div class="bg-white rounded-sm"></div>
            <div class="bg-blue-400 rounded-sm"></div>
          </div>
          <span class="font-bold text-xl tracking-wide">TTS Master</span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-4">
          <RouterLink 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="isActive(link.path) ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800 hover:text-white'"
          >
            {{ link.name }}
          </RouterLink>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button 
            @click="isOpen = !isOpen" 
            class="text-gray-200 hover:text-white focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div v-show="isOpen" class="md:hidden bg-blue-800 border-t border-blue-700">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <RouterLink 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          @click="isOpen = false"
          class="block px-3 py-2 rounded-md text-base font-medium transition"
          :class="isActive(link.path) ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'"
        >
          {{ link.name }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>