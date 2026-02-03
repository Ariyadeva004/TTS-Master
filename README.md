# 🧩 Aplikasi TTS (Teka-Teki Silang)

Aplikasi **TTS (Teka-Teki Silang)** ini merupakan aplikasi berbasis web yang dibangun menggunakan **Vue 3 (Composition API)** dan **Tailwind CSS**. Aplikasi ini mendukung pembuatan, pengelolaan, dan permainan TTS secara dinamis menggunakan data berbasis **JSON**.

Proyek ini dirancang sebagai aplikasi Technical Test dengan mengimplementasi SPA (Single Page Application) dengan sistem routing, komponen reusable, dan manajemen state sederhana.

---

## ✨ Fitur Utama

- 📋 **Daftar Puzzle TTS**
    - Menampilkan seluruh puzzle yang tersedia
    - Tombol _Play_ untuk memainkan puzzle
    - Tombol _Share_ untuk membagikan URL puzzle
    
- 🛠️ **Admin Panel**
    - Membuat puzzle TTS baru
    - Grid TTS dibuat otomatis berdasarkan kata
    - ID puzzle numerik dan berurutan
    - Data puzzle disimpan ke file `puzzles.json`
    
- 🎮 **Play TTS**
    - Bermain TTS berdasarkan ID puzzle
    - Routing dinamis `/TTS/:id`
    - Tampilan grid dan petunjuk mendatar & menurun
    
- 📦 **Manajemen Data JSON**
    - Struktur data konsisten
    - Menyimpan metadata seperti `createdAt`
    

---

## 🧱 Teknologi yang Digunakan

- **Vue.js 3** (Composition API)
- **Vue Router**
- **Tailwind CSS**
- **JavaScript (ES6+)**
- **JSON** sebagai penyimpanan data lokal
    

---

## 📂 Struktur Folder (Ringkas)

```
src/
│── components/
│   ├── TTSGrid.vue
│   ├── PuzzleCard.vue
│   └── ...
│
│── views/
│   ├── AdminPanelView.vue
│   ├── TTSListView.vue
│   └── TTSPlayView.vue
│
│── router/
│   └── index.js
│
│── data/
│   └── puzzles.json
│
└── App.vue
```

---

## 🧾 Struktur Data `puzzles.json`

Contoh struktur data puzzle:

```json
{
  "id": 1,
  "title": "TTS Hewan",
  "createdAt": "2026-02-02T10:30:00Z",
  "gridSize": 10,
  "words": [
    {
      "text": "KUCING",
      "clue": "Hewan peliharaan",
      "direction": "mendatar",
      "row": 0,
      "col": 0
    }
  ]
}
```

---

## 🚀 Cara Menjalankan Project

1. **Clone repository**
    ```bash
    git clone <repository-url>
    cd tts-app
    ```
2. **Install dependency**
    ```bash
    npm install
    ```
3. **Jalankan development server**
    ```bash
    npm run dev
    ```
4. **Akses aplikasi**  
    Buka browser dan akses:
    ```
    http://localhost:3000
    ```
    

---

## 🧠 Catatan Desain

- Pemisahan **View** dan **Component** dilakukan untuk meningkatkan reusability
- Grid TTS dibuat secara otomatis berdasarkan input kata
- Penyimpanan menggunakan JSON cocok untuk skala kecil / pembelajaran


---

## 👤 Author

**Ariyadeva Tanri**  
Proyek pembelajaran & pengembangan aplikasi Vue.js
