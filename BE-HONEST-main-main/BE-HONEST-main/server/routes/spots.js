const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Spot = require('../models/Spot');

// Create a new spot
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, type, privacy, location } = req.body;
    
    const newSpot = new Spot({
      name,
      description,
      type,
      privacy,
      location,
      creator: req.user.id
    });

    const spot = await newSpot.save();
    res.status(201).json(spot);
  } catch (err) {
    console.error('Error creating spot:', err);
    res.status(500).json({ message: 'Server error while creating spot' });
  }
});

// Get all spots (with privacy filter)
router.get('/', auth, async (req, res) => {
  try {
    const spots = await Spot.find({
      $or: [
        { privacy: 'public' },
        { privacy: 'friends', creator: { $in: [...req.user.friends, req.user.id] } },
        { creator: req.user.id }
      ]
    }).populate('creator', 'username');
    
    res.json(spots);
  } catch (err) {
    console.error('Error fetching spots:', err);
    res.status(500).json({ message: 'Server error while fetching spots' });
  }
});

module.exports = router; 