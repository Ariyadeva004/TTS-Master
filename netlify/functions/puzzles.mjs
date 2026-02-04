import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  try {
    const store = getStore("game-data");
    
    // Netlify Blobs .get() returns null if no data exists
    const rawData = await store.get("puzzles-list"); 
    const puzzles = rawData ? JSON.parse(rawData) : [];

    const segments = event.path.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    // GET /api/puzzles
    if (id === 'puzzles' || event.path.endsWith('/puzzles')) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzles)
      };
    }

    // GET /api/puzzles/:id
    const puzzle = puzzles.find(p => p.id === id);
    if (puzzle) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puzzle)
      };
    }

    return { 
      statusCode: 404, 
      body: JSON.stringify({ error: "Not Found" }) 
    };
  } catch (error) {
    console.error("Blob Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", message: error.message })
    };
  }
};
