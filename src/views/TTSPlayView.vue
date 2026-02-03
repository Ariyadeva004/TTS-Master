<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TTSBoard from '@/components/TTSBoard.vue'

const route = useRoute()
const puzzle = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Uses standard /api proxy to avoid CORS/port issues
    const res = await fetch(`/api/puzzles/${route.params.id}`)

    if (!res.ok) {
      // Fallback message if 404 or 500
      throw new Error(`Error ${res.status}: Failed to fetch puzzle`)
    }

    puzzle.value = await res.json()
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-6xl mx-auto">
      
      <!-- Header / Nav -->
      <div class="mb-6 flex items-center gap-4">
        <router-link 
            to="/" 
            class="bg-white text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-50 font-bold transition flex items-center gap-2"
        >
          &larr; Back
        </router-link>
        
        <div v-if="puzzle">
            <h1 class="text-2xl font-bold text-gray-800">{{ puzzle.title }}</h1>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-8 rounded-lg text-center shadow-sm">
        <p class="font-bold text-lg mb-2">Oops!</p>
        <p>{{ error }}</p>
        <router-link to="/" class="text-red-800 underline mt-4 inline-block">Return Home</router-link>
      </div>

      <!-- Game Board -->
      <TTSBoard v-else :puzzle="puzzle" />
      
    </div>
  </div>
</template>