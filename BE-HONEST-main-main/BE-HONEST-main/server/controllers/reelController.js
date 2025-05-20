const { db, storage } = require('../config/firebase');
const { collection, addDoc, getDocs, query, where, orderBy, limit, startAfter, doc, updateDoc, arrayUnion, arrayRemove, getDoc } = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { v4: uuidv4 } = require('uuid');
const { extractHashtags, extractMentions } = require('../utils/textUtils');
const Reel = require('../models/Reel');
const User = require('../models/User');
const Chat = require('../models/Chat');
const { uploadToCloudinary, generateThumbnail } = require('../utils/mediaUtils');
const mongoose = require('mongoose');

// Sample data store (replace with database in production)
const sampleReels = Array(20).fill(null).map((_, index) => ({
  id: `sample-${index}`,
  videoUrl: [
    'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  ][index % 8],
  caption: `Sample Reel ${index + 1}`,
  user: {
    id: `user-${index}`,
    username: `user_${index}`,
    avatar: `https://mui.com/static/images/avatar/${(index % 8) + 1}.jpg`
  },
  likes: Math.floor(Math.random() * 1000),
  comments: [],
  category: ['funny', 'lifestyle', 'educational', 'music'][index % 4],
  createdAt: new Date()
}));

// Create a new reel
exports.createReel = async (req, res) => {
  try {
    const { caption, category, music, filter, location, isPublic, allowComments, allowDuets, allowStitch } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // Upload video to Firebase Storage
    const videoFile = req.file;
    const videoId = uuidv4();
    const videoRef = ref(storage, `reels/${videoId}`);
    await uploadBytes(videoRef, videoFile.buffer);
    const videoUrl = await getDownloadURL(videoRef);

    // Create thumbnail (you'll need to implement this)
    const thumbnail = await generateThumbnail(videoFile.buffer);
    const thumbnailRef = ref(storage, `reels/thumbnails/${videoId}`);
    await uploadBytes(thumbnailRef, thumbnail);
    const thumbnailUrl = await getDownloadURL(thumbnailRef);

    // Add reel to Firestore
    const reelData = {
      videoUrl,
      thumbnailUrl,
      caption,
      category,
      music: JSON.parse(music),
      filter,
      user: {
        id: req.user.uid,
        username: req.user.username,
        avatar: req.user.avatar
      },
      location: location ? {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      } : null,
      isPublic: isPublic === 'true',
      allowComments: allowComments === 'true',
      allowDuets: allowDuets === 'true',
      allowStitch: allowStitch === 'true',
      likes: [],
      comments: [],
      createdAt: new Date(),
      hashtags: extractHashtags(caption),
      mentions: extractMentions(caption)
    };

    const docRef = await addDoc(collection(db, 'reels'), reelData);
    const newReel = { id: docRef.id, ...reelData };

    res.status(201).json(newReel);
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ message: 'Error creating reel: ' + error.message });
  }
};

// Get reels feed
exports.getReelsFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const lastDoc = req.query.lastDoc ? JSON.parse(req.query.lastDoc) : null;

    let q = query(
      collection(db, 'reels'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(parseInt(limit))
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const reels = [];
    
    querySnapshot.forEach((doc) => {
      reels.push({ id: doc.id, ...doc.data() });
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === parseInt(limit);

    res.json({
      reels,
      hasMore,
      lastDoc: lastVisible ? JSON.stringify(lastVisible) : null
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reels',
      error: error.message 
    });
  }
};

// Get user's reels
exports.getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const lastDoc = req.query.lastDoc ? JSON.parse(req.query.lastDoc) : null;

    let q = query(
      collection(db, 'reels'),
      where('user.id', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(parseInt(limit))
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const reels = [];
    
    querySnapshot.forEach((doc) => {
      reels.push({ id: doc.id, ...doc.data() });
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === parseInt(limit);

    res.json({
      reels,
      hasMore,
      lastDoc: lastVisible ? JSON.stringify(lastVisible) : null
    });
  } catch (error) {
    console.error('Error fetching user reels:', error);
    res.status(500).json({ message: 'Error fetching user reels' });
  }
};

// Like/Unlike a reel
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const reelRef = doc(db, 'reels', id);
    const reelDoc = await getDoc(reelRef);
    
    if (!reelDoc.exists()) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const reel = reelDoc.data();
    const hasLiked = reel.likes.includes(userId);

    if (hasLiked) {
      // Unlike the reel
      await updateDoc(reelRef, {
        likes: arrayRemove(userId)
      });
    } else {
      // Like the reel
      await updateDoc(reelRef, {
        likes: arrayUnion(userId)
      });
    }

    // Get updated reel
    const updatedReel = await getDoc(reelRef);
    const updatedData = updatedReel.data();

    // Emit real-time update
    req.app.get('io').to(id).emit('reelLikeUpdate', {
      reelId: id,
      likes: updatedData.likes.length,
      userId: userId,
      action: hasLiked ? 'unlike' : 'like'
    });

    res.json({ 
      likes: updatedData.likes.length, 
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like: ' + error.message });
  }
};

// Add a reaction to a reel
exports.addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, emoji } = req.body;
    const userId = req.user.uid;

    const reelRef = doc(db, 'reels', id);
    const reelDoc = await getDoc(reelRef);
    
    if (!reelDoc.exists()) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const reel = reelDoc.data();
    const reactions = reel.reactions || [];
    
    // Check if user already has this reaction
    const existingReactionIndex = reactions.findIndex(
      reaction => reaction.user === userId && reaction.type === type
    );

    if (existingReactionIndex !== -1) {
      // Remove existing reaction
      reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      reactions.push({
        user: userId,
        type,
        emoji,
        createdAt: new Date()
      });
    }

    await updateDoc(reelRef, { reactions });

    // Emit real-time update
    req.app.get('io').to(id).emit('reelReactionUpdate', {
      reelId: id,
      reactions,
      userId,
      action: existingReactionIndex !== -1 ? 'remove' : 'add',
      reactionType: type
    });

    res.json({ reactions });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Error adding reaction: ' + error.message });
  }
};

// Add a comment to a reel
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const reel = await Reel.findById(id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Get user details
    const user = await User.findById(userId).select('username avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add comment
    const comment = {
      user: userId,
      text,
      createdAt: new Date()
    };

    reel.comments.push(comment);
    await reel.save();

    // Populate the user details for the response
    const populatedComment = {
      ...comment,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar
      }
    };

    // Emit real-time update
    req.app.get('io').to(reel._id.toString()).emit('reelCommentUpdate', {
      reelId: reel._id,
      comment: populatedComment,
      commentCount: reel.comments.length
    });

    res.json({
      comment: populatedComment,
      commentCount: reel.comments.length
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment: ' + error.message });
  }
};

// Share a reel with users
exports.shareReel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userIds, reaction, message } = req.body;
    const reel = await Reel.findById(req.params.id).session(session);
    
    if (!reel) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Create chat messages for each recipient
    const chatPromises = userIds.map(async (userId) => {
      const chatMessage = {
        sender: req.user._id,
        type: 'reel',
        content: {
          reelId: reel._id,
          thumbnail: reel.thumbnail,
          caption: reel.caption,
          videoUrl: reel.videoUrls[0], // Assuming the first URL is the main video
          customMessage: message || ''
        },
        reaction: reaction || null,
        createdAt: new Date()
      };

      // Find or create chat
      const existingChat = await Chat.findOne({
        participants: { $all: [req.user._id, userId] },
        isGroupChat: false
      }).session(session);

      if (existingChat) {
        existingChat.messages.push(chatMessage);
        existingChat.lastMessage = {
          type: 'reel',
          content: message || 'Shared a reel',
          sender: req.user._id,
          timestamp: new Date()
        };
        await existingChat.save();
        return existingChat;
      } else {
        const newChat = new Chat({
          participants: [req.user._id, userId],
          messages: [chatMessage],
          lastMessage: {
            type: 'reel',
            content: message || 'Shared a reel',
            sender: req.user._id,
            timestamp: new Date()
          },
          isGroupChat: false
        });
        await newChat.save({ session });
        return newChat;
      }
    });

    const chats = await Promise.all(chatPromises);

    // Update reel's sharedWith array
    const newShares = userIds.map(userId => ({
      userId,
      reaction: reaction || null,
      sharedAt: new Date()
    }));

    reel.sharedWith.push(...newShares);
    await reel.save({ session });

    // Increment share count
    reel.shareCount = (reel.shareCount || 0) + userIds.length;
    await reel.save({ session });

    await session.commitTransaction();

    // Emit real-time update event for each recipient
    userIds.forEach(userId => {
      req.app.get('io').to(userId.toString()).emit('newReelShare', {
        senderId: req.user._id,
        reel: {
          id: reel._id,
          thumbnail: reel.thumbnail,
          caption: reel.caption,
          videoUrl: reel.videoUrls[0]
        },
        message: message || 'Shared a reel'
      });
    });

    res.json({ 
      message: 'Reel shared successfully',
      chats: chats.map(chat => ({
        id: chat._id,
        lastMessage: chat.lastMessage
      }))
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error sharing reel:', error);
    res.status(500).json({ message: 'Error sharing reel: ' + error.message });
  } finally {
    session.endSession();
  }
};

// Delete reel
exports.deleteReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this reel' });
    }

    // Remove reel from user's reels
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { reels: reelId }
    });

    await reel.remove();
    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reel', error: error.message });
  }
};

// Screen sharing functions
exports.startScreenShare = async (req, res) => {
  try {
    const { reelId } = req.params;
    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Update reel with screen sharing status
    reel.screenSharing = {
      isActive: true,
      startedBy: req.user._id,
      startTime: new Date()
    };

    await reel.save();

    // Emit screen sharing event to other participants
    req.app.get('io').to(reelId).emit('screenShare:started', {
      userId: req.user._id,
      username: req.user.username
    });

    res.json({ message: 'Screen sharing started' });
  } catch (error) {
    res.status(500).json({ message: 'Error starting screen share', error: error.message });
  }
};

exports.stopScreenShare = async (req, res) => {
  try {
    const { reelId } = req.params;
    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Update reel with screen sharing status
    reel.screenSharing = {
      isActive: false,
      endedBy: req.user._id,
      endTime: new Date()
    };

    await reel.save();

    // Emit screen sharing event to other participants
    req.app.get('io').to(reelId).emit('screenShare:stopped', {
      userId: req.user._id,
      username: req.user.username
    });

    res.json({ message: 'Screen sharing stopped' });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping screen share', error: error.message });
  }
};

// Recording functions
exports.saveRecording = async (req, res) => {
  try {
    const { reelId } = req.params;
    const recordingFile = req.file;

    if (!recordingFile) {
      return res.status(400).json({ message: 'Recording file is required' });
    }

    // Upload recording to cloud storage
    const recordingUrl = await uploadToCloudinary(recordingFile.path);

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Add recording to reel
    reel.recordings.push({
      url: recordingUrl,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await reel.save();

    res.status(201).json({ message: 'Recording saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving recording', error: error.message });
  }
};

exports.getRecordings = async (req, res) => {
  try {
    const recordings = await Reel.find({
      'recordings.createdBy': req.user._id
    })
    .select('recordings')
    .populate('recordings.createdBy', 'username profilePicture');

    const formattedRecordings = recordings.flatMap(reel =>
      reel.recordings.map(recording => ({
        ...recording.toObject(),
        reelId: reel._id
      }))
    );

    res.json(formattedRecordings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recordings', error: error.message });
  }
};

exports.deleteRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const reel = await Reel.findOne({
      'recordings._id': recordingId
    });

    if (!reel) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const recording = reel.recordings.id(recordingId);
    if (recording.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this recording' });
    }

    // Delete recording from cloud storage
    await deleteFromCloud(recording.url);

    // Remove recording from reel
    recording.remove();
    await reel.save();

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recording', error: error.message });
  }
};

// Call settings functions
exports.getCallSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('callSettings');
    res.json(user.callSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching call settings', error: error.message });
  }
};

exports.updateCallSettings = async (req, res) => {
  try {
    const settings = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      $set: { callSettings: settings }
    });
    res.json({ message: 'Call settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating call settings', error: error.message });
  }
}; 