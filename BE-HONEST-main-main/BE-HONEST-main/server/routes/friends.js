const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get friends locations
router.get('/locations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // For now, return mock data for friends locations
    const friendsWithLocations = user.friends.map(friend => ({
      _id: friend._id,
      username: friend.username,
      online: Math.random() > 0.5, // Random online status
      streak: Math.floor(Math.random() * 10), // Random streak
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Random locations around NYC
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      }
    }));

    res.json(friendsWithLocations);
  } catch (err) {
    console.error('Error fetching friends locations:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 