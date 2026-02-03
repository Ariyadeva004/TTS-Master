<script setup>
    import CreatePuzzle from './CreatePuzzle.vue'
    import TTSListings from './TTSListings.vue'
</script>


<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-green-100 flex flex-col items-center py-10 px-4">
        <div class="w-full max-w-6xl bg-white p-6 rounded-2xl shadow-lg mb-8">
            <h1 class="text-4xl font-extrabold text-blue-700 text-center">
                TTS Creator - Admin Panel
            </h1>
            <p class="text-center text-gray-600 mt-2">
                Buat puzzle otomatis (grid dibuat otomatis) dan kelola history puzzle
            </p>
        </div>


        <div class="w-full max-w-6xl grid grid-flow-row grid-rows-2 gap-8">
            <CreatePuzzle />
            <TTSListings
            variant="admin"
            title="History Puzzle"
            :showHeader="true"
            />
        </div>
    </div>
</template>