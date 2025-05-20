const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get user's notifications
router.get('/', 
  auth, 
  notificationController.getNotifications
);

// Mark notifications as read
router.post('/mark-read', 
  auth, 
  notificationController.markAsRead
);

// Delete notifications
router.delete('/', 
  auth, 
  notificationController.deleteNotifications
);

// Update notification preferences
router.put('/preferences', 
  auth, 
  notificationController.updatePreferences
);

// Get unread count
router.get('/unread-count', 
  auth, 
  notificationController.getUnreadCount
);

// Clear all notifications
router.delete('/clear-all', 
  auth, 
  notificationController.clearAll
);

module.exports = router; 