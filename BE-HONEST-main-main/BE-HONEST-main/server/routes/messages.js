const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { messageValidator } = require('../middleware/validators');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Get messages for a chat
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a new message
router.post('/', messageValidator, async (req, res) => {
  try {
    const { content, chatId, attachments, userId } = req.body;

    const chat = await Chat.findOne({
      _id: chatId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = new Message({
      sender: userId,
      chat: chatId,
      content,
      attachments: attachments || []
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.metadata.lastActivity = new Date();
    chat.metadata.totalMessages += 1;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark messages as read
router.post('/read', async (req, res) => {
  try {
    const { chatId, messageIds, userId } = req.body;

    if (!chatId || !messageIds || !Array.isArray(messageIds) || !userId) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const chat = await Chat.findOne({
      _id: chatId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        chat: chatId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { userId } = req.body;
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

// Send an image message
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id; // Assuming you have user info in req.user

    // Find or create chat between sender and receiver
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
      type: 'private'
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        type: 'private',
        metadata: {
          createdBy: senderId,
          lastActivity: new Date(),
          totalMessages: 0
        }
      });
      await chat.save();
    }

    // Create message with image
    const message = new Message({
      sender: senderId,
      chat: chat._id,
      content: 'Image',
      attachments: [{
        type: 'image',
        url: `/uploads/images/${req.file.filename}`
      }]
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.metadata.lastActivity = new Date();
    chat.metadata.totalMessages += 1;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending image message', error: error.message });
  }
});

module.exports = router; 