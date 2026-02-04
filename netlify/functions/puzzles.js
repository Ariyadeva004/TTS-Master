import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  try {
    // 1. Initialize the store
    const store = getStore("game-data"); 
    
    // 2. Extract resource ID from the path
    const segments = event.path.split('/').filter(Boolean);
    const resource = segments[segments.length - 1];

    // 3. Retrieve data (using getJSON or standard get)
    // Use JSON.parse if the convenience method isn't available in your version
    const rawData = await store.get("puzzles-list"); 
    const puzzles = rawData ? JSON.parse(rawData) : [];

    // 4. Handle Routing
    if (resource === 'puzzles') {
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

    return { statusCode: 404, body: JSON.stringify({ error: "Puzzle not found" }) };
  } catch (error) {
    // This will appear in your Function Logs in the Netlify UI
    console.error("Function Error:", error); 
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
};
