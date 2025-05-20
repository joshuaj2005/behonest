const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/memories');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Create a new memory
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, location, privacy, tags } = req.body;
    
    const newMemory = new Memory({
      title,
      description,
      location: JSON.parse(location),
      privacy,
      tags: tags ? JSON.parse(tags) : [],
      creator: req.user.id,
      images: req.files ? req.files.map(file => `/uploads/memories/${file.filename}`) : []
    });

    const memory = await newMemory.save();
    res.status(201).json(memory);
  } catch (err) {
    console.error('Error creating memory:', err);
    res.status(500).json({ message: 'Server error while creating memory' });
  }
});

// Get all memories (with privacy filter)
router.get('/', auth, async (req, res) => {
  try {
    const memories = await Memory.find({
      $or: [
        { privacy: 'public' },
        { privacy: 'friends', creator: { $in: [...req.user.friends, req.user.id] } },
        { creator: req.user.id }
      ]
    }).populate('creator', 'username avatar');
    
    res.json(memories);
  } catch (err) {
    console.error('Error fetching memories:', err);
    res.status(500).json({ message: 'Server error while fetching memories' });
  }
});

module.exports = router; 