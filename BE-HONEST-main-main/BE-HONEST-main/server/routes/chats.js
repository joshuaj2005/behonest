const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
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

// Get all chat users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('username profilePicture status lastActive')
      .sort({ lastActive: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching chat users:', err);
    res.status(500).json({ error: 'Failed to load chat users' });
  }
});

// Get all chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('participants', '-password')
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: '-password' }
      })
      .sort({ lastActive: -1 });
    res.json({ chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Update user status
router.post('/status', async (req, res) => {
  try {
    const userId = req.body.userId; // Get userId from request body instead of auth
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = req.body.status;
    user.lastActive = new Date();
    await user.save();

    res.json({ status: user.status, lastActive: user.lastActive });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Create a new chat
router.post('/', async (req, res) => {
  try {
    const { participantId, isGroupChat, groupName } = req.body;

    if (!isGroupChat && !participantId) {
      return res.status(400).json({ message: 'Participant ID is required for private chats' });
    }

    if (isGroupChat && !groupName) {
      return res.status(400).json({ message: 'Group name is required for group chats' });
    }

    const chatData = {
      participants: isGroupChat ? [...req.body.participants] : [participantId],
      isGroupChat,
      groupName: isGroupChat ? groupName : undefined
    };

    const chat = new Chat(chatData);
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username profilePicture');

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat', error: error.message });
  }
});

// Get chat by ID
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'username profilePicture')
      .populate('messages.sender', 'username profilePicture');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error: error.message });
  }
});

// Get messages for a chat
router.get('/:chatId/messages', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: '-password'
        }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find chat and send message
router.post('/:chatId/messages', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { content, type, userId } = req.body; // Get userId from request body

    // Find the chat without ObjectId casting
    const chat = await Chat.findOne({ _id: chatId });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create and save the new message
    const newMessage = new Message({
      chat: chatId,
      sender: userId,
      content,
      type: type || 'text'
    });

    await newMessage.save();

    // Update chat's lastMessage
    chat.lastMessage = newMessage._id;
    await chat.save();

    // Populate sender details
    await newMessage.populate('sender', 'username avatar');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Add reaction to message
router.post('/:chatId/messages/:messageId/react', async (req, res) => {
  try {
    const { emoji } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.reactions.push({
      emoji,
      user: chat.participants[0] // Use first participant as reactor
    });

    await chat.save();
    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Error adding reaction', error: error.message });
  }
});

// Update call status
router.post('/:chatId/call', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { type } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.callStatus = type;
    chat.lastActive = new Date();
    await chat.save();

    res.json({ chat });
  } catch (err) {
    console.error('Error updating call status:', err);
    res.status(500).json({ error: 'Failed to update call status' });
  }
});

// Handle voice message upload
router.post('/:chatId/messages/voice', upload.single('audio'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      content: `/uploads/${req.file.filename}`,
      type: 'voice',
      sender: chat.participants[0],
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.metadata.lastActivity = new Date();
    chat.metadata.totalMessages += 1;
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username profilePicture'
        }
      });

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending voice message:', error);
    res.status(500).json({ message: 'Error sending voice message', error: error.message });
  }
});

// Handle file upload
router.post('/:chatId/messages/file', upload.single('file'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      content: `/uploads/${req.file.filename}`,
      type: 'file',
      fileName: req.file.originalname,
      sender: chat.participants[0],
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.metadata.lastActivity = new Date();
    chat.metadata.totalMessages += 1;
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username profilePicture'
        }
      });

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router; 