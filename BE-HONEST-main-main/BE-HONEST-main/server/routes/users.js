const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { updateProfileValidator } = require('../middleware/validators');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -resetPasswordToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, updateProfileValidator, async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['username', 'bio', 'profilePicture', 'settings'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }
      ]
    })
    .select('username email profilePicture bio')
    .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

// Send friend request
router.post('/friends/request', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friend request already exists
    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });

    await targetUser.save();
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error: error.message });
  }
});

// Accept/Reject friend request
router.patch('/friends/request/:userId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { userId } = req.params;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = req.user.friendRequests.find(
      req => req.from.toString() === userId && req.status === 'pending'
    );

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (status === 'accepted') {
      // Add to friends list for both users
      await User.findByIdAndUpdate(userId, {
        $addToSet: { friends: req.user._id }
      });

      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { friends: userId }
      });
    }

    // Update request status
    request.status = status;
    await req.user.save();

    res.json({ message: `Friend request ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Error processing friend request', error: error.message });
  }
});

// Get friends list
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username email profilePicture bio status lastSeen');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends', error: error.message });
  }
});

// Remove friend
router.delete('/friends/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: req.user._id }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
});

// Update location
router.post('/location', auth, async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    await req.user.updateLocation(coordinates);
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
});

// Add multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/bitmojis')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Upload Bitmoji
router.post('/bitmoji', auth, upload.single('bitmoji'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user's bitmoji URL
    user.bitmoji = `/uploads/bitmojis/${req.file.filename}`;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Bitmoji uploaded successfully',
      bitmoji: user.bitmoji 
    });
  } catch (error) {
    console.error('Error uploading bitmoji:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Bitmoji customization
router.put('/bitmoji/customize', auth, async (req, res) => {
  try {
    const { skinTone, hairColor, hairStyle, eyeColor, outfit } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update customization
    user.bitmojiCustomization = {
      skinTone: skinTone || user.bitmojiCustomization.skinTone,
      hairColor: hairColor || user.bitmojiCustomization.hairColor,
      hairStyle: hairStyle || user.bitmojiCustomization.hairStyle,
      eyeColor: eyeColor || user.bitmojiCustomization.eyeColor,
      outfit: outfit || user.bitmojiCustomization.outfit
    };

    await user.save();

    res.json({
      success: true,
      message: 'Bitmoji customization updated successfully',
      bitmojiCustomization: user.bitmojiCustomization
    });
  } catch (error) {
    console.error('Error updating bitmoji customization:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 