const express = require('express');
const router = express.Router();
const { 
  saveMessage, 
  getChatMessages, 
  updateMessageStatus, 
  editMessage, 
  deleteMessage 
} = require('../utils/messageUtils');
const { db } = require('../config/firebase');

// Test Firebase connection
router.get('/test-firebase', async (req, res) => {
  try {
    // Try to write a test document
    const testRef = db.collection('test').doc('connection-test');
    await testRef.set({
      timestamp: new Date(),
      status: 'connected'
    });
    
    // Try to read it back
    const doc = await testRef.get();
    
    if (doc.exists) {
      res.json({ 
        success: true, 
        message: 'Firebase connection successful',
        data: doc.data()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Firebase connection test failed' 
      });
    }
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Firebase connection error',
      error: error.message 
    });
  }
});

// Test route to save a message
router.post('/test-save', async (req, res) => {
  try {
    const { text, userId, type, chatId } = req.body;
    const messageId = await saveMessage(text, userId, type, chatId);
    res.json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages for a chat
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit } = req.query;
    const messages = await getChatMessages(chatId, parseInt(limit));
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update message status
router.patch('/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, userId } = req.body;
    await updateMessageStatus(messageId, status, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Edit message
router.patch('/:messageId/edit', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newText } = req.body;
    await editMessage(messageId, newText);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    await deleteMessage(messageId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 