const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { sampleUsers, getRandomResponse } = require('../data/sampleChatUsers');

// Get all users for chat
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .sort({ lastSeen: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get chat history with a user
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar');
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;
    
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content,
      type,
      timestamp: new Date()
    });

    const message = await newMessage.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Emit the message through socket if needed
    if (req.app.io) {
      req.app.io.to(receiverId).emit('new_message', populatedMessage);
    }

    res.json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Upload image message
router.post('/send-image', auth, async (req, res) => {
  try {
    const { receiverId, imageUrl } = req.body;
    
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content: imageUrl,
      type: 'image',
      timestamp: new Date()
    });

    const message = await newMessage.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    if (req.app.io) {
      req.app.io.to(receiverId).emit('new_message', populatedMessage);
    }

    res.json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get all chat users
router.get('/users', (req, res) => {
  try {
    res.json({ success: true, users: sampleUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/users/:userId', (req, res) => {
  try {
    const user = sampleUsers.find(u => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

// Send message to a user
router.post('/messages/send', (req, res) => {
  try {
    const { userId, message } = req.body;
    const user = sampleUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate AI response
    const response = getRandomResponse(userId);
    
    res.json({
      success: true,
      message: {
        id: Date.now().toString(),
        text: response,
        sender: user.id,
        timestamp: new Date(),
        status: 'delivered'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// Get chat history
router.get('/messages/:userId', (req, res) => {
  try {
    const user = sampleUsers.find(u => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate sample chat history
    const chatHistory = [
      {
        id: '1',
        text: getRandomResponse(user.id, 'greeting'),
        sender: user.id,
        timestamp: new Date(Date.now() - 86400000), // 24 hours ago
        status: 'delivered'
      },
      {
        id: '2',
        text: getRandomResponse(user.id, 'interests'),
        sender: user.id,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'delivered'
      }
    ];

    res.json({ success: true, messages: chatHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
});

module.exports = router; 