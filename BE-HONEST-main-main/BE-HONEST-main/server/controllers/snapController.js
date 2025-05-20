const SnapStreak = require('../models/SnapStreak');
const User = require('../models/User');
const Snap = require('../models/Snap');

// Update user's location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      location: { lat, lng },
      lastSeen: new Date()
    });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

// Get friends' locations
exports.getFriendsLocations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('friends');
    
    const friendsLocations = await Promise.all(
      user.friends.map(async (friend) => {
        const streak = await SnapStreak.findOne({
          users: { $all: [userId, friend._id] }
        });

        return {
          _id: friend._id,
          username: friend.username,
          profilePicture: friend.profilePicture,
          location: friend.location,
          online: friend.online,
          lastSeen: friend.lastSeen,
          streak: streak ? streak.currentStreak : 0
        };
      })
    );

    res.json(friendsLocations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends locations', error: error.message });
  }
};

// Send a snap
exports.sendSnap = async (req, res) => {
  try {
    const { recipientId, message, location } = req.body;
    const senderId = req.user._id;

    // Create new snap
    const snap = new Snap({
      sender: senderId,
      recipient: recipientId,
      message,
      location
    });
    await snap.save();

    // Update streak
    const streak = await SnapStreak.findOrCreateStreak(senderId, recipientId);
    await streak.updateStreak();

    // Emit socket event for real-time updates
    req.app.get('io').to(recipientId).emit('new:snap', {
      snap,
      streak: streak.currentStreak
    });

    res.json({ message: 'Snap sent successfully', snap, streak: streak.currentStreak });
  } catch (error) {
    res.status(500).json({ message: 'Error sending snap', error: error.message });
  }
};

// Get user's streaks
exports.getStreaks = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const streaks = await SnapStreak.find({
      users: userId
    }).populate('users', 'username profilePicture');

    const formattedStreaks = streaks.map(streak => {
      const otherUser = streak.users.find(user => user._id.toString() !== userId.toString());
      return {
        user: otherUser,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastInteraction: streak.lastInteraction,
        status: streak.status
      };
    });

    res.json(formattedStreaks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching streaks', error: error.message });
  }
};

// Get filtered friends list
exports.getFilteredFriends = async (req, res) => {
  try {
    const { showStreaks, showOnline, showOffline } = req.query;
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('friends');
    const friends = await Promise.all(
      user.friends.map(async (friend) => {
        const streak = await SnapStreak.findOne({
          users: { $all: [userId, friend._id] }
        });

        return {
          _id: friend._id,
          username: friend.username,
          profilePicture: friend.profilePicture,
          online: friend.online,
          lastSeen: friend.lastSeen,
          streak: streak ? streak.currentStreak : 0
        };
      })
    );

    const filteredFriends = friends.filter(friend => {
      if (showStreaks === 'true' && friend.streak > 0) return true;
      if (showOnline === 'true' && friend.online) return true;
      if (showOffline === 'true' && !friend.online) return true;
      return false;
    });

    res.json(filteredFriends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filtered friends', error: error.message });
  }
}; 