// netlify/functions/puzzles.js
import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  try {
    const store = getStore("game-data");
    const segments = event.path.split('/').filter(Boolean);
    const resource = segments[segments.length - 1];

    // Logika untuk mengambil data
    const rawData = await store.get("puzzles-list", { type: "json" });
    const puzzles = rawData || [];

    if (resource === 'puzzles' || event.path.endsWith('/puzzles')) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzles)
      };
    }

    const puzzle = puzzles.find(p => p.id === resource);
    if (puzzle) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzle)
      };
    }

    return { 
      statusCode: 404, 
      body: JSON.stringify({ error: "Puzzle tidak ditemukan" }) 
    };
  } catch (error) {
    console.error("Error di Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Terjadi kesalahan internal pada server" })
    };
  }
};
