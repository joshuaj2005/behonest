// Basic game utility functions
const generateGameId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const validateGameMove = (move) => {
  return true; // Basic validation
};

module.exports = {
  generateGameId,
  validateGameMove
}; 