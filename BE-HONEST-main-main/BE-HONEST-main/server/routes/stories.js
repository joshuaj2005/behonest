const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a new story
router.post('/', 
  auth, 
  upload.single('media'),
  storyController.createStory
);

// Get stories for user's feed
router.get('/feed', 
  auth, 
  storyController.getFeedStories
);

// View a story
router.post('/:storyId/view', 
  auth, 
  storyController.viewStory
);

// Delete a story
router.delete('/:storyId', 
  auth, 
  storyController.deleteStory
);

// Get story viewers
router.get('/:storyId/viewers', 
  auth, 
  storyController.getStoryViewers
);

module.exports = router; 