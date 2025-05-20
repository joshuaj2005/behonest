const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Notification = require('./models/Notification');
const { corsOptions } = require('./server');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: corsOptions
  });

  // Store active users
  const activeUsers = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      activeUsers.set(decoded.userId, socket.id);
      user.status = 'online';
      await user.save();

      // Notify friends of online status
      user.friends.forEach(friendId => {
        const friendSocketId = activeUsers.get(friendId.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit('friend_status_change', {
            userId: user._id,
            status: 'online'
          });
        }
      });

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const userId = Array.from(activeUsers.entries())
          .find(([_, socketId]) => socketId === socket.id)?.[0];

        if (userId) {
          activeUsers.delete(userId);
          const user = await User.findById(userId);
          if (user) {
            user.status = 'offline';
            user.lastActive = new Date();
            await user.save();

            // Notify friends of offline status
            user.friends.forEach(friendId => {
              const friendSocketId = activeUsers.get(friendId.toString());
              if (friendSocketId) {
                io.to(friendSocketId).emit('friend_status_change', {
                  userId: user._id,
                  status: 'offline',
                  lastActive: user.lastActive
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Disconnection error:', error);
      }
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text' } = data;
        const chat = await Chat.findById(chatId).populate('participants');
        
        if (chat) {
          const message = {
            sender: socket.user._id,
            content,
            type,
            chat: chatId,
            createdAt: new Date()
          };

          chat.messages.push(message);
          chat.lastActive = new Date();
          await chat.save();

          // Emit to all participants
          chat.participants.forEach(participant => {
            const participantSocketId = activeUsers.get(participant._id.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('new_message', {
                chatId,
                message
              });
            }
          });
        }
      } catch (error) {
        console.error('Message sending error:', error);
      }
    });

    // Handle typing status
    socket.on('typing', async (data) => {
      try {
        const { chatId, isTyping } = data;
        const chat = await Chat.findById(chatId).populate('participants');
        
        if (chat) {
          chat.participants.forEach(participant => {
            if (participant._id.toString() !== socket.user._id.toString()) {
              const participantSocketId = activeUsers.get(participant._id.toString());
              if (participantSocketId) {
                io.to(participantSocketId).emit('typing_status', {
                  chatId,
                  userId: socket.user._id,
                  isTyping
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Typing status error:', error);
      }
    });

    // Handle read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { chatId, messageId } = data;
        const chat = await Chat.findById(chatId);
        
        if (chat) {
          const message = chat.messages.id(messageId);
          if (message && !message.readBy.includes(socket.user._id)) {
            message.readBy.push(socket.user._id);
            await chat.save();

            // Notify sender
            const senderSocketId = activeUsers.get(message.sender.toString());
            if (senderSocketId) {
              io.to(senderSocketId).emit('message_read', {
                chatId,
                messageId,
                readBy: message.readBy
              });
            }
          }
        }
      } catch (error) {
        console.error('Read receipt error:', error);
      }
    });

    // Handle voice/video calls
    socket.on('start_call', async (data) => {
      try {
        const { to, type } = data;
        const recipientSocketId = activeUsers.get(to);
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('incoming_call', {
            from: socket.user._id,
            type
          });
        }
      } catch (error) {
        console.error('Call initiation error:', error);
      }
    });

    socket.on('accept_call', async (data) => {
      try {
        const { to } = data;
        const callerSocketId = activeUsers.get(to);
        
        if (callerSocketId) {
          io.to(callerSocketId).emit('call_accepted', {
            by: socket.user._id
          });
        }
      } catch (error) {
        console.error('Call acceptance error:', error);
      }
    });

    socket.on('reject_call', async (data) => {
      try {
        const { to } = data;
        const callerSocketId = activeUsers.get(to);
        
        if (callerSocketId) {
          io.to(callerSocketId).emit('call_rejected', {
            by: socket.user._id
          });
        }
      } catch (error) {
        console.error('Call rejection error:', error);
      }
    });

    socket.on('end_call', async (data) => {
      try {
        const { to } = data;
        const recipientSocketId = activeUsers.get(to);
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('call_ended', {
            by: socket.user._id
          });
        }
      } catch (error) {
        console.error('Call end error:', error);
      }
    });

    // Handle group chat
    socket.on('create_group', async (data) => {
      try {
        const { name, members } = data;
        const groupChat = new Chat({
          chatName: name,
          isGroupChat: true,
          participants: [...members, socket.user._id],
          groupAdmin: socket.user._id
        });

        await groupChat.save();
        const populatedChat = await Chat.findById(groupChat._id)
          .populate('participants', 'username email avatar status')
          .populate('groupAdmin', 'username email avatar');

        // Notify all members
        members.forEach(memberId => {
          const memberSocketId = activeUsers.get(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit('group_created', {
              group: populatedChat
            });
          }
        });
      } catch (error) {
        console.error('Group creation error:', error);
      }
    });

    socket.on('join_group', async (data) => {
      try {
        const { groupId } = data;
        const chat = await Chat.findById(groupId);
        
        if (chat && !chat.participants.includes(socket.user._id)) {
          chat.participants.push(socket.user._id);
          await chat.save();

          const populatedChat = await Chat.findById(groupId)
            .populate('participants', 'username email avatar status')
            .populate('groupAdmin', 'username email avatar');

          // Notify all group members
          chat.participants.forEach(participantId => {
            const participantSocketId = activeUsers.get(participantId.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('user_joined_group', {
                groupId,
                group: populatedChat
              });
            }
          });
        }
      } catch (error) {
        console.error('Group join error:', error);
      }
    });

    socket.on('leave_group', async (data) => {
      try {
        const { groupId } = data;
        const chat = await Chat.findById(groupId);
        
        if (chat) {
          chat.participants = chat.participants.filter(
            id => id.toString() !== socket.user._id.toString()
          );
          await chat.save();

          // Notify remaining group members
          chat.participants.forEach(participantId => {
            const participantSocketId = activeUsers.get(participantId.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('user_left_group', {
                groupId,
                userId: socket.user._id
              });
            }
          });
        }
      } catch (error) {
        console.error('Group leave error:', error);
      }
    });
  });

  return io;
};

// Helper function to update user status
const updateUserStatus = async (userId, status) => {
  try {
    const user = await User.findById(userId);
    user.status = status;
    user.lastActive = new Date();
    await user.save();

    // Notify user's friends about status change
    user.friends.forEach(friendId => {
      io.to(friendId.toString()).emit('user_status_changed', {
        userId: user._id,
        status,
        lastActive: user.lastActive
      });
    });
  } catch (error) {
    console.error('Update user status error:', error);
  }
};

// Function to emit notifications
const emitNotification = async (notification) => {
  try {
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'username profilePicture');

    io.to(notification.recipient.toString()).emit('new_notification', populatedNotification);
  } catch (error) {
    console.error('Emit notification error:', error);
  }
};

module.exports = {
  initializeSocket,
  emitNotification
}; 