const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const reelsRoutes = require('./reels');
const messageRoutes = require('./messages');

// Remove the /api prefix from individual route files
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/reels', reelsRoutes);
router.use('/messages', messageRoutes);

module.exports = router; 