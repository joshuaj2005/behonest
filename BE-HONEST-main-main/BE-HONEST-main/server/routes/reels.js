const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const reelController = require('../controllers/reelController');
const auth = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Create a new reel
router.post('/', auth, upload.single('video'), reelController.createReel);

// Get reels feed
router.get('/feed', auth, reelController.getReelsFeed);

// Get user's reels
router.get('/user/:userId', auth, reelController.getUserReels);

// Like/Unlike a reel
router.post('/:id/like', auth, reelController.toggleLike);

// Add reaction to a reel
router.post('/:id/reaction', auth, reelController.addReaction);

module.exports = router; 