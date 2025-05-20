const User = require('../models/User');

// Get active calls for a user
exports.getActiveCalls = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('activeCalls')
      .populate('activeCalls.from', 'username profilePicture status')
      .populate('activeCalls.to', 'username profilePicture status');

    res.json(user.activeCalls);
  } catch (error) {
    console.error('Get active calls error:', error);
    res.status(500).json({ message: 'Server error while fetching active calls' });
  }
};

// Start a new call
exports.startCall = async (req, res) => {
  try {
    const { targetId } = req.body;
    const caller = await User.findById(req.user._id);
    const receiver = await User.findById(targetId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in a call
    if (caller.activeCalls.length > 0) {
      return res.status(400).json({ message: 'You are already in a call' });
    }

    // Create new call
    const call = {
      from: req.user._id,
      to: targetId,
      type: req.body.type || 'video', // 'video' or 'audio'
      status: 'pending',
      startTime: new Date()
    };

    // Add call to both users' active calls
    caller.activeCalls.push(call);
    receiver.activeCalls.push(call);

    await Promise.all([caller.save(), receiver.save()]);

    // Emit call request to receiver
    req.app.get('io').to(`user:${targetId}`).emit('call:request', {
      from: {
        id: req.user._id,
        username: caller.username,
        profilePicture: caller.profilePicture
      },
      type: call.type
    });

    res.json(call);
  } catch (error) {
    console.error('Start call error:', error);
    res.status(500).json({ message: 'Server error while starting call' });
  }
};

// Accept a call
exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const user = await User.findById(req.user._id);
    const call = user.activeCalls.find(c => c._id.toString() === callId);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (call.status !== 'pending') {
      return res.status(400).json({ message: 'Call is not pending' });
    }

    // Update call status
    call.status = 'active';
    await user.save();

    // Update call status for the other user
    const otherUser = await User.findById(call.from);
    const otherCall = otherUser.activeCalls.find(c => c._id.toString() === callId);
    otherCall.status = 'active';
    await otherUser.save();

    // Notify caller that call was accepted
    req.app.get('io').to(`user:${call.from}`).emit('call:accepted', {
      callId,
      from: {
        id: req.user._id,
        username: user.username,
        profilePicture: user.profilePicture
      }
    });

    res.json(call);
  } catch (error) {
    console.error('Accept call error:', error);
    res.status(500).json({ message: 'Server error while accepting call' });
  }
};

// Reject a call
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const user = await User.findById(req.user._id);
    const call = user.activeCalls.find(c => c._id.toString() === callId);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Remove call from both users
    user.activeCalls = user.activeCalls.filter(c => c._id.toString() !== callId);
    await user.save();

    const otherUser = await User.findById(call.from);
    otherUser.activeCalls = otherUser.activeCalls.filter(c => c._id.toString() !== callId);
    await otherUser.save();

    // Notify caller that call was rejected
    req.app.get('io').to(`user:${call.from}`).emit('call:rejected', { callId });

    res.json({ message: 'Call rejected successfully' });
  } catch (error) {
    console.error('Reject call error:', error);
    res.status(500).json({ message: 'Server error while rejecting call' });
  }
};

// End a call
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const user = await User.findById(req.user._id);
    const call = user.activeCalls.find(c => c._id.toString() === callId);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Remove call from both users
    user.activeCalls = user.activeCalls.filter(c => c._id.toString() !== callId);
    await user.save();

    const otherUser = await User.findById(call.from);
    otherUser.activeCalls = otherUser.activeCalls.filter(c => c._id.toString() !== callId);
    await otherUser.save();

    // Notify other user that call ended
    req.app.get('io').to(`user:${call.from}`).emit('call:ended', { callId });

    res.json({ message: 'Call ended successfully' });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ message: 'Server error while ending call' });
  }
}; 