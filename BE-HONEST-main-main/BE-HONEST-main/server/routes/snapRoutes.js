const express = require('express');
const router = express.Router();
const snapController = require('../controllers/snapController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Location routes
router.post('/location', snapController.updateLocation);
router.get('/friends/locations', snapController.getFriendsLocations);

// Snap routes
router.post('/send', snapController.sendSnap);

// Streak routes
router.get('/streaks', snapController.getStreaks);

// Filter routes
router.get('/friends/filtered', snapController.getFilteredFriends);

module.exports = router; 