<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  puzzle: {
    type: Object,
    required: true,
  },
})

// --- 1. State ---
const isSolved = ref(false)

// --- 2. Normalize Grid Size ---
const rows = computed(() => {
  if (props.puzzle.gridSize) return Number(props.puzzle.gridSize)
  if (props.puzzle.Grid?.Menurun) return Number(props.puzzle.Grid.Menurun)
  return 10
})

const cols = computed(() => {
  if (props.puzzle.gridSize) return Number(props.puzzle.gridSize)
  if (props.puzzle.Grid?.Mendatar) return Number(props.puzzle.Grid.Mendatar)
  return 10
})

// --- 3. Normalize Clues & Solutions ---
const parsedData = computed(() => {
  const result = {
    Mendatar: [],
    Menurun: []
  }

  // Case A: Old Format (has Clues object)
  if (props.puzzle.Clues) {
    if (props.puzzle.Clues.Mendatar) result.Mendatar = props.puzzle.Clues.Mendatar
    if (props.puzzle.Clues.Menurun) result.Menurun = props.puzzle.Clues.Menurun
  }
  // Case B: New Format (has placements array)
  else if (props.puzzle.placements && Array.isArray(props.puzzle.placements)) {
    props.puzzle.placements.forEach((p, index) => {
      const item = {
        number: index + 1,
        row: p.row,
        col: p.col,
        answer: p.word,
        clue: p.clue
      }
      if (p.dir === 'across') result.Mendatar.push(item)
      else result.Menurun.push(item)
    })
  }

  return result
})

// --- 4. Compute Cell Numbers for UI ---
const cellNumbers = computed(() => {
  const map = {}
  const addToMap = (list) => {
    list.forEach(item => {
      const key = `${item.row}-${item.col}`
      map[key] = item.number
    })
  }
  addToMap(parsedData.value.Mendatar)
  addToMap(parsedData.value.Menurun)
  return map
})

// --- 5. Board Initialization ---
const board = ref([])
const solution = ref([])

function initBoard() {
  isSolved.value = false // Reset solved state on new puzzle
  const r = rows.value
  const c = cols.value

  board.value = Array.from({ length: r }, () => Array(c).fill(''))
  solution.value = Array.from({ length: r }, () => Array(c).fill(null))

  const { Mendatar, Menurun } = parsedData.value

  Mendatar.forEach(item => {
    const letters = (item.answer || '').split('')
    letters.forEach((char, i) => {
      if (solution.value[item.row] && solution.value[item.row][item.col + i] !== undefined) {
        solution.value[item.row][item.col + i] = char
      }
    })
  })

  Menurun.forEach(item => {
    const letters = (item.answer || '').split('')
    letters.forEach((char, i) => {
      if (solution.value[item.row + i] && solution.value[item.row + i][item.col] !== undefined) {
        solution.value[item.row + i][item.col] = char
      }
    })
  })
}

watch(() => props.puzzle, initBoard, { immediate: true })

// --- 6. Check Win Logic ---
function checkWin() {
  let correctCount = 0
  let totalLetters = 0

  for (let r = 0; r < rows.value; r++) {
    for (let c = 0; c < cols.value; c++) {
      const sol = solution.value[r][c]
      if (sol !== null) {
        totalLetters++
        if (board.value[r][c] === sol) {
          correctCount++
        }
      }
    }
  }

  // If all letters are filled and correct
  if (totalLetters > 0 && correctCount === totalLetters) {
    isSolved.value = true
    // If you add a backend later, this is where you'd call apiPost('/solve', { id: props.puzzle.id })
  }
}

const onInput = (e, r, c) => {
  if (isSolved.value) return // Prevent editing if already solved
  
  if (!board.value[r]) return
  board.value[r][c] = e.target.value.slice(0, 1).toUpperCase()
  
  // Check for win after every input
  checkWin()
}

// Styling Logic
const cellClass = (r, c) => {
  const correct = solution.value[r]?.[c]
  const current = board.value[r]?.[c]

  // Black cell
  if (correct === null) return 'bg-black'

  // Validation Feedback
  if (current && current === correct) return 'bg-green-100'
  if (current && current !== correct) return 'bg-red-100'
  
  return 'bg-white'
}
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-8 items-start relative">
    
    <!-- BOARD CONTAINER WRAPPER -->
    <div class="relative inline-block">
        
      <!-- SOLVED OVERLAY -->
      <div 
        v-if="isSolved" 
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-900/40 backdrop-blur-sm rounded-lg transition-all duration-500"
      >
        <div class="bg-white p-6 rounded-2xl shadow-2xl text-center border-4 border-green-500 transform scale-105">
           <div class="text-5xl mb-2">🎉</div>
           <h2 class="text-3xl font-extrabold text-green-700 mb-1">SOLVED!</h2>
           <p class="text-gray-600 font-medium">Excellent work.</p>
           <button 
             @click="isSolved = false"
             class="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition shadow-lg"
           >
             Review Board
           </button>
        </div>
      </div>

      <!-- NEWSPAPER STYLE GRID -->
      <div class="bg-black p-1 border-4 border-black shadow-2xl">
        <div class="flex flex-col gap-[1px] bg-black border border-black">
          <div v-for="(row, r) in board" :key="r" class="flex gap-[1px]">
            <div
              v-for="(cell, c) in row"
              :key="c"
              class="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
              :class="cellClass(r, c)"
            >
              <!-- Clue Number -->
              <span 
                v-if="cellNumbers[`${r}-${c}`]" 
                class="absolute top-0.5 left-0.5 text-[10px] md:text-xs leading-none font-sans font-bold text-gray-800 z-10 pointer-events-none"
              >
                {{ cellNumbers[`${r}-${c}`] }}
              </span>

              <!-- Input Field -->
              <input
                v-if="solution[r][c] !== null"
                type="text"
                maxlength="1"
                :value="cell"
                @input="onInput($event, r, c)"
                :disabled="isSolved"
                class="w-full h-full text-center font-bold text-xl md:text-2xl uppercase bg-transparent outline-none border-none text-black caret-transparent cursor-pointer focus:bg-blue-50/50 z-20 disabled:cursor-default disabled:bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CLUES CONTAINER -->
    <div class="flex-1 w-full lg:w-auto bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[600px] overflow-hidden flex flex-col">
      <h2 class="text-2xl font-bold mb-4 text-gray-800 border-b pb-2 flex justify-between items-center">
        <span>Clues</span>
        <span v-if="isSolved" class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 animate-pulse">✅ Completed</span>
      </h2>
      
      <div class="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
        <!-- Across -->
        <div>
          <h3 class="font-bold text-lg mb-3 text-white bg-gray-800 px-3 py-1 inline-block rounded-sm shadow-sm">Mendatar</h3>
          <ul class="space-y-2">
            <li v-for="c in parsedData.Mendatar" :key="`across-${c.number}`" class="text-sm border-b border-gray-100 pb-1 last:border-0 group">
              <span class="font-bold text-gray-900 inline-block min-w-[20px] group-hover:text-blue-600">{{ c.number }}.</span>
              <span class="text-gray-700 group-hover:text-gray-900">{{ c.clue }}</span>
            </li>
          </ul>
          <div v-if="parsedData.Mendatar.length === 0" class="text-gray-400 text-sm italic">None</div>
        </div>

        <!-- Down -->
        <div>
          <h3 class="font-bold text-lg mb-3 text-white bg-gray-800 px-3 py-1 inline-block rounded-sm shadow-sm">Menurun</h3>
          <ul class="space-y-2">
            <li v-for="c in parsedData.Menurun" :key="`down-${c.number}`" class="text-sm border-b border-gray-100 pb-1 last:border-0 group">
              <span class="font-bold text-gray-900 inline-block min-w-[20px] group-hover:text-blue-600">{{ c.number }}.</span>
              <span class="text-gray-700 group-hover:text-gray-900">{{ c.clue }}</span>
            </li>
          </ul>
          <div v-if="parsedData.Menurun.length === 0" class="text-gray-400 text-sm italic">None</div>
        </div>
      </div>
    </div>

  </div>
</template>