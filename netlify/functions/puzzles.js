// netlify/functions/puzzles.js
import puzzlesData from '../../src/puzzles.json' with { type: 'json' };

export const handler = async (event) => {
  const segments = event.path.split('/').filter(Boolean);
  const resource = segments[segments.length - 1];

  if (resource === 'puzzles') {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(puzzlesData.puzzles)
    };
  }

  const puzzle = puzzlesData.puzzles.find(p => p.id === resource);
  
  if (puzzle) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(puzzle)
    };
  }

  return { 
    statusCode: 404, 
    body: JSON.stringify({ error: "Puzzle not found" }) 
  };
};
