const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      recipient: req.user._id
    })
    .populate('sender', 'username profilePicture')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

    const total = await Notification.countDocuments({
      recipient: req.user._id
    });

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      total,
      unreadCount,
      hasMore: total > skip + notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notification IDs' });
    }

    await Notification.markManyAsRead(req.user._id, notificationIds);

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
};

// Delete notifications
exports.deleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notification IDs' });
    }

    await Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: req.user._id
    });

    res.json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    console.error('Delete notifications error:', error);
    res.status(500).json({ message: 'Error deleting notifications' });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ message: 'Invalid preferences' });
    }

    const user = await User.findById(req.user._id);
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };
    await user.save();

    res.json({
      message: 'Notification preferences updated',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Error updating notification preferences' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

// Clear all notifications
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user._id
    });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ message: 'Error clearing notifications' });
  }
}; 