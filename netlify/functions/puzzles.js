// netlify/functions/puzzles.js
const puzzlesData = require('../../src/puzzles.json');

exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/puzzles', '');
  const segments = path.split('/').filter(Boolean);

  // GET /api/puzzles
  if (segments.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(puzzlesData.puzzles),
      headers: { "Content-Type": "application/json" }
    };
  }

  // GET /api/puzzles/:id
  const id = segments[0];
  const puzzle = puzzlesData.puzzles.find(p => p.id === id);

  if (puzzle) {
    return {
      statusCode: 200,
      body: JSON.stringify(puzzle),
      headers: { "Content-Type": "application/json" }
    };
  }

  return { statusCode: 404, body: "Puzzle not found" };
};