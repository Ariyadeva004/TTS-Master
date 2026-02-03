<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  puzzle: { type: Object, required: true },
})

const copied = ref(false)

function copyLink() {
  // Construct the full URL: current_origin/TTS/id
  const link = `${window.location.origin}/TTS/${props.puzzle.id}`

  // Create a temporary textarea to handle the copy (robust method)
  const textArea = document.createElement("textarea")
  textArea.value = link
  document.body.appendChild(textArea)
  textArea.select()
  
  try {
    document.execCommand('copy')
    copied.value = true
    
    // Reset the "Copied" text after 2 seconds
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy', err)
    alert('Failed to copy link: ' + link)
  }
  
  document.body.removeChild(textArea)
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md transition hover:shadow-lg border border-gray-100">
    <div class="flex justify-between items-center mb-4">
      <span class="text-md font-bold text-gray-800 truncate pr-2">{{ puzzle.title || 'Untitled' }}</span>
      <span class="text-xs bg-gray-200 text-gray-700 rounded px-2 py-1 whitespace-nowrap">ID: {{ puzzle.id }}</span>
    </div>

    <hr class="mb-4 border-gray-100" />

    <div class="flex flex-row gap-2 justify-between mb-4 text-gray-600">
      <div class="text-center flex-1 border-r border-gray-100 last:border-0">
        <h2 class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Grid</h2>
        <span class="font-medium text-sm block">{{ puzzle.Grid?.Mendatar ?? puzzle.gridSize ?? '-' }}x{{ puzzle.Grid?.Menurun ?? puzzle.gridSize ?? '-' }}</span>
      </div>

      <div class="text-center flex-1 border-r border-gray-100 last:border-0">
        <h2 class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Words</h2>
        <span class="font-medium text-sm block">{{ puzzle.Word ?? (Array.isArray(puzzle.words) ? puzzle.words.length : '-') }}</span>
      </div>

      <div class="text-center flex-1">
        <h2 class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</h2>
        <span class="font-medium text-sm block truncate px-1">
            {{ puzzle.Created || (puzzle.createdAt ? new Date(puzzle.createdAt).toLocaleDateString() : '-') }}
        </span>
      </div>
    </div>

    <div class="flex gap-3 mt-auto">
      <RouterLink 
        :to="`/TTS/${puzzle.id}`"
        class="bg-gray-900 hover:bg-black text-white font-bold py-2 px-4 rounded flex-1 text-center transition shadow-sm text-sm flex items-center justify-center"
      >
        Play
      </RouterLink>
      
      <button 
        @click="copyLink"
        class="font-bold py-2 px-4 rounded flex-1 transition shadow-sm text-sm flex items-center justify-center gap-1"
        :class="copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
      >
        <span v-if="copied">Copied!</span>
        <span v-else>Share</span>
      </button>
    </div>
  </div>
</template>