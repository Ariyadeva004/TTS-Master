// netlify/functions/puzzles.js
import { getStore } from "@netlify/blobs";

// DO NOT use module.exports. Use 'export const'
export const handler = async (event, context) => {
  try {
    const store = getStore("game-data");
    const segments = event.path.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    // Data retrieval logic
    const puzzles = await store.get("puzzles-list", { type: "json" }) || [];

    if (id === 'puzzles') {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzles)
      };
    }

    const puzzle = puzzles.find(p => p.id === id);
    if (puzzle) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzle)
      };
    }

    return { statusCode: 404, body: "Not Found" };
  } catch (err) {
    // This log will appear in your Netlify Function Logs
    console.error("Function Error:", err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
