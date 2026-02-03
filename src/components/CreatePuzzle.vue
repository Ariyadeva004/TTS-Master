<script setup>
import { computed, reactive, watch } from 'vue'

const state = reactive({
  title: '',
  createdDate: '',
  gridSize: 10,

  newWord: '',
  newClue: '',
  words: [], // { word, clue }

  grid: [], // array 1D: '#'/letters
  placements: [],
  generationError: '',

  saveStatus: '',
  saveStatusType: 'ok',
  saving: false,
})

const normalizeWord = (w) => {
  return (w || '').toUpperCase().replace(/[^A-Z]/g, '')
}

const idx = (r, c, size) => r * size + c
const inBounds = (r, c, size) => r >= 0 && r < size && c >= 0 && c < size

function createBlankGrid(size) {
  return Array(size * size).fill('#')
}

function getCell(grid, r, c, size) {
  return grid[idx(r, c, size)]
}

function setCell(grid, r, c, size, v) {
  grid[idx(r, c, size)] = v
}

function canPlaceWord(grid, word, row, col, dir, size) {
  const dr = dir === 'down' ? 1 : 0
  const dc = dir === 'across' ? 1 : 0

  const beforeR = row - dr
  const beforeC = col - dc
  if (inBounds(beforeR, beforeC, size) && getCell(grid, beforeR, beforeC, size) !== '#') return false

  const afterR = row + dr * word.length
  const afterC = col + dc * word.length
  if (inBounds(afterR, afterC, size) && getCell(grid, afterR, afterC, size) !== '#') return false

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i
    const c = col + dc * i
    if (!inBounds(r, c, size)) return false

    const cell = getCell(grid, r, c, size)
    const ch = word[i]

    if (cell !== '#' && cell !== ch) return false

    // aturan adjacency sederhana
    if (dir === 'across') {
      const up = r - 1
      const down = r + 1
      if (inBounds(up, c, size) && getCell(grid, up, c, size) !== '#') {
        if (cell === '#') return false
      }
      if (inBounds(down, c, size) && getCell(grid, down, c, size) !== '#') {
        if (cell === '#') return false
      }
    } else {
      const left = c - 1
      const right = c + 1
      if (inBounds(r, left, size) && getCell(grid, r, left, size) !== '#') {
        if (cell === '#') return false
      }
      if (inBounds(r, right, size) && getCell(grid, r, right, size) !== '#') {
        if (cell === '#') return false
      }
    }
  }

  return true
}

function placeWord(grid, word, row, col, dir, size) {
  const dr = dir === 'down' ? 1 : 0
  const dc = dir === 'across' ? 1 : 0

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i
    const c = col + dc * i
    setCell(grid, r, c, size, word[i])
  }
}

function findAllLetterMatches(grid, ch, size) {
  const matches = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = getCell(grid, r, c, size)
      if (cell === ch) matches.push({ r, c })
    }
  }
  return matches
}

function tryPlaceWithIntersections(grid, word, size) {
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    const spots = findAllLetterMatches(grid, ch, size)
    for (const s of spots) {
      const rowA = s.r
      const colA = s.c - i
      if (canPlaceWord(grid, word, rowA, colA, 'across', size)) {
        return { row: rowA, col: colA, dir: 'across' }
      }

      const rowD = s.r - i
      const colD = s.c
      if (canPlaceWord(grid, word, rowD, colD, 'down', size)) {
        return { row: rowD, col: colD, dir: 'down' }
      }
    }
  }
  return null
}

function tryPlaceFallback(grid, word, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - word.length; c++) {
      if (canPlaceWord(grid, word, r, c, 'across', size)) {
        return { row: r, col: c, dir: 'across' }
      }
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - word.length; r++) {
      if (canPlaceWord(grid, word, r, c, 'down', size)) {
        return { row: r, col: c, dir: 'down' }
      }
    }
  }
  return null
}

function generateCrossword(words, size) {
  const cleaned = words
    .map((w) => ({ word: normalizeWord(w.word), clue: (w.clue || '').trim() }))
    .filter((w) => w.word.length >= 2 && w.clue.length > 0)

  if (cleaned.length < 5) {
    return { ok: false, error: 'Minimal 5 kata (dan clue) untuk publish.' }
  }

  const longest = Math.max(...cleaned.map((w) => w.word.length))
  if (longest > size) {
    return { ok: false, error: `Ukuran grid (${size}) terlalu kecil. Kata terpanjang panjangnya ${longest}.` }
  }

  const sorted = [...cleaned].sort((a, b) => b.word.length - a.word.length)
  const grid = createBlankGrid(size)
  const placements = []

  const first = sorted[0]
  const midRow = Math.floor(size / 2)
  const startCol = Math.max(0, Math.floor((size - first.word.length) / 2))
  if (!canPlaceWord(grid, first.word, midRow, startCol, 'across', size)) {
    return { ok: false, error: 'Gagal membuat grid: kata pertama tidak bisa ditempatkan.' }
  }
  placeWord(grid, first.word, midRow, startCol, 'across', size)
  placements.push({ word: first.word, clue: first.clue, row: midRow, col: startCol, dir: 'across' })

  for (let k = 1; k < sorted.length; k++) {
    const w = sorted[k]

    let pos = tryPlaceWithIntersections(grid, w.word, size)
    if (!pos) pos = tryPlaceFallback(grid, w.word, size)

    if (!pos) {
      return { ok: false, error: `Grid penuh / sulit menaruh kata: ${w.word}. Coba perbesar grid.` }
    }

    placeWord(grid, w.word, pos.row, pos.col, pos.dir, size)
    placements.push({ word: w.word, clue: w.clue, row: pos.row, col: pos.col, dir: pos.dir })
  }

  return { ok: true, grid, placements }
}

function countAcrossDown(grid, size) {
  const isBlocked = (i) => grid[i] === '#'
  let across = 0
  let down = 0

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c
      if (isBlocked(i)) continue

      const leftBlocked = c === 0 || isBlocked(i - 1)
      const rightOpen = c < size - 1 && !isBlocked(i + 1)
      if (leftBlocked && rightOpen) across++

      const upBlocked = r === 0 || isBlocked(i - size)
      const downOpen = r < size - 1 && !isBlocked(i + size)
      if (upBlocked && downOpen) down++
    }
  }

  return { across, down }
}

function regenerate() {
  state.generationError = ''

  const result = generateCrossword(state.words, state.gridSize)
  if (!result.ok) {
    state.grid = createBlankGrid(state.gridSize)
    state.placements = []
    state.generationError = result.error
    return
  }

  state.grid = result.grid
  state.placements = result.placements
}

watch(
  () => [state.words.length, state.gridSize],
  () => {
    regenerate()
  }
)

const canPublish = computed(() => {
  return state.words.length >= 5 && !state.generationError && !state.saving
})

function addWord() {
  const w = normalizeWord(state.newWord)
  const c = (state.newClue || '').trim()
  if (!w || w.length < 2 || !c) return

  state.words.push({ word: w, clue: c })
  state.newWord = ''
  state.newClue = ''
}

function removeWord(index) {
  state.words.splice(index, 1)
}

function resetAll() {
  state.title = ''
  state.createdDate = ''
  state.gridSize = 10
  state.newWord = ''
  state.newClue = ''
  state.words = []
  state.grid = createBlankGrid(10)
  state.placements = []
  state.generationError = ''
  state.saveStatus = ''
  state.saveStatusType = 'ok'
  state.saving = false
}

async function apiGet(path) {
  const res = await fetch(`/api${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET ${path} gagal (${res.status})`)
  return res.json()
}

async function apiPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} gagal (${res.status})`)
  return res.json()
}

async function getNextNumericId() {
  // Ambil semua puzzles, cari max id numerik, lalu +1
  const data = await apiGet('/puzzles')
  const arr = Array.isArray(data) ? data : []

  let maxId = 0
  for (const p of arr) {
    const n = Number(p?.id)
    if (Number.isFinite(n) && n > maxId) maxId = n
  }

  return maxId + 1
}

function buildPayload(id) {
  const created = state.createdDate || new Date().toISOString().slice(0, 10)
  const { across, down } = countAcrossDown(state.grid, state.gridSize)

  return {
    id: String(id),
    title: state.title || 'Untitled Puzzle',
    Word: String(state.words.length),
    Created: created,
    Grid: {
      Mendatar: String(across),
      Menurun: String(down),
    },
    gridSize: state.gridSize,
    grid: state.grid,
    words: state.words,
    placements: state.placements,
    createdAt: new Date().toISOString(),
  }
}

async function publishPuzzle() {
  state.saveStatus = ''
  state.saveStatusType = 'ok'

  if (state.words.length < 5) {
    state.saveStatus = 'Minimal 5 kata + clue sebelum publish.'
    state.saveStatusType = 'err'
    return
  }

  regenerate()
  if (state.generationError) {
    state.saveStatus = state.generationError
    state.saveStatusType = 'err'
    return
  }

  try {
    state.saving = true

    const nextId = await getNextNumericId()
    const payload = buildPayload(nextId)

    await apiPost('/puzzles', payload)
    window.dispatchEvent(new Event('puzzles-updated'))

    state.saveStatus = `Puzzle berhasil dipublish. ID: ${nextId}`
    state.saveStatusType = 'ok'

    resetAll()
  } catch (err) {
    console.error(err)
    state.saveStatus = err?.message ?? 'Gagal publish puzzle.'
    state.saveStatusType = 'err'
  } finally {
    state.saving = false
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-lg">
    <h2 class="text-2xl font-bold text-green-600 mb-4">Buat Puzzle Baru</h2>

    <div class="mb-4">
      <label class="block text-gray-700 font-semibold mb-2">Judul Puzzle</label>
      <input v-model="state.title" type="text" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
    </div>

    <div class="mb-4">
      <label class="block text-gray-700 font-semibold mb-2">Tanggal Dibuat</label>
      <input v-model="state.createdDate" type="date" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
    </div>

    <div class="mb-6">
      <label class="block text-gray-700 font-semibold mb-2">Ukuran Grid (min 5)</label>
      <input v-model.number="state.gridSize" type="number" min="5" max="20" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
      <p class="text-xs text-gray-500 mt-2">
        Grid akan dibuat otomatis dari daftar kata. Jika ada kata yang tidak muat, perbesar grid.
      </p>
    </div>

    <div class="mb-6">
      <h3 class="text-lg font-bold text-blue-600 mb-2">Tambah Kata (minimal 5 kata)</h3>

      <div class="flex gap-2 mb-2">
        <input
          v-model="state.newWord"
          type="text"
          placeholder="Kata (huruf A-Z)"
          class="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <input
          v-model="state.newClue"
          type="text"
          placeholder="Clue"
          class="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        @click="addWord"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition"
      >
        Tambah Kata
      </button>

      <ul class="mt-4 space-y-2">
        <li
          v-for="(word, index) in state.words"
          :key="index"
          class="p-2 bg-gray-100 rounded-lg flex justify-between items-center"
        >
          <div>
            <span class="font-bold">{{ word.word }}</span> - {{ word.clue }}
          </div>
          <button @click="removeWord(index)" class="text-red-500 hover:text-red-700">Hapus</button>
        </li>
      </ul>

      <p class="text-sm mt-3" :class="state.words.length >= 5 ? 'text-green-700' : 'text-gray-600'">
        Total kata: <b>{{ state.words.length }}</b> / 5
      </p>
    </div>

    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-bold text-blue-600">Preview Grid (Otomatis)</h3>
        <button
          @click="regenerate"
          class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg"
        >
          Regenerate
        </button>
      </div>

      <p v-if="state.generationError" class="text-sm text-red-600 mb-2">
        {{ state.generationError }}
      </p>

      <div class="inline-block bg-white border rounded-lg p-2 overflow-auto max-w-full">
        <div
          class="grid gap-1"
          :style="{ gridTemplateColumns: `repeat(${state.gridSize}, 28px)` }"
        >
          <div
            v-for="(cell, i) in state.grid"
            :key="i"
            class="w-[28px] h-[28px] flex items-center justify-center border text-xs font-bold"
            :class="cell === '#' ? 'bg-gray-800 text-gray-800' : 'bg-white text-gray-900'"
          >
            {{ cell === '#' ? '' : cell }}
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-500 mt-2">
        Sel yang tidak dipakai otomatis menjadi blok (#).
      </p>
    </div>

    <button
      @click="publishPuzzle"
      :disabled="!canPublish"
      class="w-full font-bold py-3 rounded-lg transition"
      :class="canPublish ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'"
    >
      {{ state.saving ? 'Publishing...' : 'Publish Puzzle' }}
    </button>

    <p v-if="state.saveStatus" class="mt-3 text-center text-sm" :class="state.saveStatusType === 'ok' ? 'text-green-600' : 'text-red-600'">
      {{ state.saveStatus }}
    </p>
  </div>
</template>