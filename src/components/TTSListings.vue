<script setup>
import { reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { RouterLink } from 'vue-router'
import TTSList from '@/components/TTSList.vue';

const props = defineProps({
  limit: Number,
  variant: { type: String, default: 'public' }, // 'public' | 'admin'
  title: { type: String, default: 'Browse Puzzles' },
  showHeader: { type: Boolean, default: true },
})

const state = reactive({
  puzzles: [],
  loading: true,
  error: null,
})

// --- API Helpers ---
async function apiGet(path) {
  // Use /api proxy path
  const res = await fetch(`/api${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
  return res.json()
}

async function apiDelete(path) {
  const res = await fetch(`/api${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete (${res.status})`)
  return true
}

// --- Actions ---
async function load() {
  state.loading = true
  state.error = null
  try {
    const data = await apiGet('/puzzles')
    // Ensure we always have an array, even if API returns null/undefined
    let arr = Array.isArray(data) ? data : []
    
    // Sort by newest first (assuming higher ID = newer, or use Created date)
    arr.sort((a, b) => Number(b.id) - Number(a.id))
    
    state.puzzles = arr
  } catch (err) {
    console.error(err)
    state.error = "Could not load puzzles. Please ensure the server is running."
  } finally {
    // Artificial delay for smooth skeleton transition (optional)
    setTimeout(() => { state.loading = false }, 300)
  }
}

async function deletePuzzle(id) {
  const ok = confirm('Are you sure you want to permanently delete this puzzle?')
  if (!ok) return

  try {
    await apiDelete(`/puzzles/${id}`)
    // Optimistic UI update: remove immediately
    state.puzzles = state.puzzles.filter(p => p.id !== id)
    window.dispatchEvent(new Event('puzzles-updated'))
  } catch (err) {
    console.error(err)
    alert('Failed to delete puzzle.')
    await load() // Reload to restore state if failed
  }
}

// --- Computed ---
const displayed = computed(() => {
  return props.limit ? state.puzzles.slice(0, props.limit) : state.puzzles
})

// --- Lifecycle ---
const onUpdated = () => load()

onMounted(() => {
  load()
  window.addEventListener('puzzles-updated', onUpdated)
})

onBeforeUnmount(() => {
  window.removeEventListener('puzzles-updated', onUpdated)
})
</script>

<template>
  <section class="w-full">
    
    <!-- Header Section -->
    <div v-if="props.showHeader" class="flex items-center justify-between mb-6">
      <h2 
        class="text-2xl font-bold tracking-tight"
        :class="props.variant === 'admin' ? 'text-gray-800' : 'text-gray-800'"
      >
        {{ props.title }}
      </h2>
      <button
        @click="load"
        :disabled="state.loading"
        class="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ state.loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Error State -->
    <div v-if="state.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700 font-medium">{{ state.error }}</p>
        </div>
      </div>
    </div>

    <!-- SKELETON LOADING STATE -->
    <div v-if="state.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in (props.limit || 3)" :key="n" class="bg-white p-6 rounded-lg shadow border border-gray-100 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-32 bg-gray-200 rounded mb-4"></div>
        <div class="flex gap-2">
            <div class="h-8 bg-gray-200 rounded flex-1"></div>
            <div class="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>

    <!-- PUBLIC VARIANT: Grid View -->
    <div v-else-if="props.variant === 'public'">
      <div v-if="displayed.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <TTSList
          v-for="puzzle in displayed"
          :key="puzzle.id"
          :puzzle="puzzle"
        />
      </div>
      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
         <div class="text-gray-300 mb-3">
            <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
         </div>
         <h3 class="text-lg font-medium text-gray-900">No Puzzles Found</h3>
         <p class="text-gray-500 mt-1">Be the first to create one!</p>
      </div>
    </div>

    <!-- ADMIN VARIANT: List/Table View -->
    <div v-else class="flex flex-col space-y-3">
      <div v-if="displayed.length > 0">
        <div 
          v-for="puzzle in displayed"
          :key="puzzle.id"
          class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-md"
        >
          <!-- Info Column -->
          <div class="flex items-start gap-4">
             <div class="bg-blue-100 text-blue-700 font-bold p-3 rounded-lg text-lg min-w-[50px] text-center">
                {{ puzzle.gridSize || puzzle.Grid?.Mendatar || '10' }}<span class="text-xs">x</span>{{ puzzle.gridSize || puzzle.Grid?.Menurun || '10' }}
             </div>
             <div>
                <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ puzzle.title || 'Untitled Puzzle' }}</h3>
                <div class="text-xs text-gray-500 mt-1 flex gap-2 items-center">
                    <span class="bg-gray-100 px-2 py-0.5 rounded">ID: {{ puzzle.id }}</span>
                    <span>•</span>
                    <span>{{ puzzle.Word ?? (Array.isArray(puzzle.words) ? puzzle.words.length : 0) }} Words</span>
                    <span>•</span>
                    <span>{{ puzzle.Created || 'Unknown Date' }}</span>
                </div>
             </div>
          </div>

          <!-- Actions Column -->
          <div class="flex gap-2 w-full sm:w-auto">
            <RouterLink
              :to="`/TTS/${puzzle.id}`"
              class="flex-1 sm:flex-none text-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition text-sm"
            >
              View
            </RouterLink>
            <button
              @click="deletePuzzle(puzzle.id)"
              class="flex-1 sm:flex-none text-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium px-4 py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty Admin State -->
      <div v-else class="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
         <p class="text-gray-500">No puzzles available to manage.</p>
      </div>
    </div>

  </section>
</template>