<script setup>
import { ref } from 'vue'

// You can emit these values to the parent component later if you want to filter the list
const searchQuery = ref('')
const filterOption = ref('newest')
</script>

<template>
    <div class="relative bg-gradient-to-r from-blue-500 to-indigo-800 rounded-b-xl shadow-xl overflow-hidden mb-10 text-white">
        <!-- Abstract Background Shapes -->
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div class="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
            <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-green-400 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div class="relative z-10 flex flex-col items-center justify-center py-12 px-6 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                Play & Create Crosswords
            </h1>
            <p class="text-blue-100 text-lg md:text-xl max-w-2xl mb-8">
                Challenge your brain with our community puzzles or design your own grid in minutes.
            </p>
        </div>
    </div>
</template>