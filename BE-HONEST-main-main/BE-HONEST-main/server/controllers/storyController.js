const Story = require('../models/Story');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Create a new story
exports.createStory = async (req, res) => {
  try {
    const { caption, duration, privacy } = req.body;
    const mediaFile = req.file;

    if (!mediaFile) {
      return res.status(400).json({ message: 'Media file is required' });
    }

    // Upload media to Cloudinary
    const mediaUpload = await uploadToCloudinary(mediaFile.path);
    const mediaType = mediaFile.mimetype.startsWith('image/') ? 'image' : 'video';

    const story = new Story({
      user: req.user._id,
      mediaUrl: mediaUpload.url,
      mediaType,
      thumbnail: mediaType === 'video' ? mediaUpload.thumbnail : mediaUpload.url,
      caption,
      duration: duration || 24,
      privacy: privacy || 'friends'
    });

    await story.save();

    // Notify user's friends
    const user = await User.findById(req.user._id);
    const notificationPromises = user.friends.map(friendId => {
      return new Notification({
        recipient: friendId,
        sender: req.user._id,
        type: 'story_update',
        content: `${user.username} added a new story`,
        relatedModel: 'Story',
        relatedId: story._id
      }).save();
    });

    await Promise.all(notificationPromises);

    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Error creating story' });
  }
};

// Get stories for user's feed
exports.getFeedStories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendIds = user.friends;

    // Get active stories from friends and user
    const stories = await Story.find({
      $or: [
        { user: { $in: [...friendIds, req.user._id] } },
        { privacy: 'public' }
      ],
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('user', 'username profilePicture')
    .sort('-createdAt');

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (error) {
    console.error('Get feed stories error:', error);
    res.status(500).json({ message: 'Error fetching stories' });
  }
};

// View a story
exports.viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Add viewer if not already viewed
    if (!story.hasViewed(req.user._id)) {
      await story.addViewer(req.user._id);

      // Create notification for story owner
      if (story.user.toString() !== req.user._id.toString()) {
        await new Notification({
          recipient: story.user,
          sender: req.user._id,
          type: 'story_view',
          content: `${req.user.username} viewed your story`,
          relatedModel: 'Story',
          relatedId: story._id
        }).save();
      }
    }

    res.json({ message: 'Story viewed successfully' });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Error viewing story' });
  }
};

// Delete a story
exports.deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findOne({
      _id: storyId,
      user: req.user._id
    });

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    await story.remove();
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Error deleting story' });
  }
};

// Get story viewers
exports.getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findOne({
      _id: storyId,
      user: req.user._id
    }).populate('viewers.user', 'username profilePicture');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json(story.viewers);
  } catch (error) {
    console.error('Get story viewers error:', error);
    res.status(500).json({ message: 'Error fetching story viewers' });
  }
}; 