const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const miniGameController = require('../controllers/miniGameController');

// Create a new game
router.post('/', auth, miniGameController.createGame);

// Join a game
router.post('/:gameId/join', auth, miniGameController.joinGame);

// Start a game
router.post('/:gameId/start', auth, miniGameController.startGame);

// Handle game actions
router.post('/:gameId/action', auth, miniGameController.handleGameAction);

// Get game status
router.get('/:gameId', auth, miniGameController.getGameStatus);

module.exports = router; 