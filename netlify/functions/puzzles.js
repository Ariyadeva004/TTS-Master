import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  // Initialize the store named 'game-data'
  const store = getStore("game-data"); 
  const segments = event.path.split('/').filter(Boolean);
  const resource = segments[segments.length - 1];

  // HANDLE GET REQUESTS (Reading Data)
  if (event.httpMethod === "GET") {
    const rawData = await store.get("puzzles-list", { type: "json" });
    const puzzles = rawData || []; // Fallback to empty array if none exist

    if (resource === 'puzzles') {
      return { statusCode: 200, body: JSON.stringify(puzzles) };
    }

    const puzzle = puzzles.find(p => p.id === resource);
    return puzzle 
      ? { statusCode: 200, body: JSON.stringify(puzzle) }
      : { statusCode: 404, body: "Not Found" };
  }

  // HANDLE POST REQUESTS (Saving Data from Admin Panel)
  if (event.httpMethod === "POST") {
    const newPuzzle = JSON.parse(event.body);
    const currentData = await store.get("puzzles-list", { type: "json" }) || [];
    
    // Add new puzzle to the list
    currentData.push(newPuzzle);
    
    // Save back to Netlify Blobs
    await store.setJSON("puzzles-list", currentData);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Puzzle saved successfully!" })
    };
  }
};
