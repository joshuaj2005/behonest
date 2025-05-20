import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Drawer,
  Badge,
  Divider,
  Paper,
  ListItemIcon,
  Checkbox
} from '@mui/material';
import { 
  Send as SendIcon,
  Menu as MenuIcon,
  SmartToy as SmartToyIcon,
  VideoCall as VideoCallIcon,
  Call as CallIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import Story from './Story';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      online: true,
      lastSeen: null,
      messages: [
        { content: "Hey! How's your project going?", sender: '1', timestamp: '2024-03-20T10:30:00Z' },
        { content: "I've been working on the UI design", sender: 'me', timestamp: '2024-03-20T10:31:00Z' },
        { content: "That's great! Would love to see it sometime", sender: '1', timestamp: '2024-03-20T10:32:00Z' }
      ]
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'MC',
      online: true,
      lastSeen: null,
      messages: [
        { content: "Did you check out the new framework?", sender: '2', timestamp: '2024-03-20T11:00:00Z' },
        { content: "Yes, it looks promising!", sender: 'me', timestamp: '2024-03-20T11:01:00Z' },
        { content: "We should use it in our next sprint", sender: '2', timestamp: '2024-03-20T11:02:00Z' }
      ]
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'ED',
      online: true,
      lastSeen: null,
      messages: [
        { content: "Team meeting at 3 PM?", sender: '3', timestamp: '2024-03-20T09:00:00Z' },
        { content: "I'll be there!", sender: 'me', timestamp: '2024-03-20T09:01:00Z' },
        { content: "Great, see you then!", sender: '3', timestamp: '2024-03-20T09:02:00Z' }
      ]
    },
    {
      id: '4',
      name: 'Alex Thompson',
      avatar: 'AT',
      online: false,
      lastSeen: '2024-03-20T08:45:00Z',
      messages: [
        { content: "Can you review my PR when you get a chance?", sender: '4', timestamp: '2024-03-20T08:30:00Z' },
        { content: "Sure, I'll take a look", sender: 'me', timestamp: '2024-03-20T08:31:00Z' },
        { content: "Thanks!", sender: '4', timestamp: '2024-03-20T08:32:00Z' }
      ]
    },
    {
      id: '5',
      name: 'Lisa Wang',
      avatar: 'LW',
      online: false,
      lastSeen: '2024-03-20T07:15:00Z',
      messages: [
        { content: "Don't forget about the client presentation tomorrow", sender: '5', timestamp: '2024-03-20T07:00:00Z' },
        { content: "I've prepared all the slides", sender: 'me', timestamp: '2024-03-20T07:01:00Z' },
        { content: "Perfect, good work!", sender: '5', timestamp: '2024-03-20T07:02:00Z' }
      ]
    }
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [isHonorBotActive, setIsHonorBotActive] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [callType, setCallType] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const handleNewMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    if (message.sender !== selectedUser?.id) {
      setUnreadMessages(prev => ({
        ...prev,
        [message.sender]: (prev[message.sender] || 0) + 1
      }));
    }
  }, [selectedUser]);

  const handleCallRequest = useCallback((data) => {
    if (data.from === selectedUser?.id) {
      setCallType(data.type);
      setIsCallActive(true);
    }
  }, [selectedUser]);

  const handleCallAccepted = useCallback((data) => {
    if (data.from === selectedUser?.id) {
      setIsCallActive(true);
    }
  }, [selectedUser]);

  const handleCallEnded = useCallback(() => {
    setCallType(null);
    setIsCallActive(false);
  }, []);

  const handleUserStatus = useCallback((data) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === data.userId 
          ? { ...user, online: data.online }
          : user
      )
    );
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.filter(user => user.id !== socket?.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [socket]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('message', handleNewMessage);
    socket.on('userStatus', handleUserStatus);
    socket.on('callRequest', handleCallRequest);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callEnded', handleCallEnded);

    fetchUsers();
    fetchGroups();

    return () => {
      socket.off('message', handleNewMessage);
      socket.off('userStatus', handleUserStatus);
      socket.off('callRequest', handleCallRequest);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callEnded', handleCallEnded);
    };
  }, [socket, handleNewMessage, handleUserStatus, handleCallRequest, handleCallAccepted, handleCallEnded, fetchUsers, fetchGroups]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      content: newMessage,
      sender: socket.id,
      receiver: isHonorBotActive ? 'honor-bot' : selectedUser?.id,
      timestamp: new Date().toISOString()
    };

    if (isHonorBotActive) {
      handleHonorBotMessage(message);
    } else if (selectedUser) {
      socket.emit('message', message);
      setMessages(prev => [...prev, message]);
    }
    setNewMessage('');
  };

  const handleHonorBotMessage = async (message) => {
    setMessages(prev => [...prev, message]);
    
    // Enhanced Honor Bot responses
    const honorBotResponses = {
      greetings: [
        "Hello! How can I assist you today?",
        "Hi there! I'm Honor, your friendly AI assistant.",
        "Greetings! I'm here to help you with anything you need."
      ],
      questions: [
        "That's an interesting question! Let me help you with that.",
        "I'd be happy to help you understand that better.",
        "Great question! Here's what I know about that."
      ],
      thanks: [
        "You're welcome! Is there anything else you'd like to know?",
        "Happy to help! Let me know if you need anything else.",
        "Anytime! Don't hesitate to ask more questions."
      ],
      default: [
        "I understand. Could you tell me more about that?",
        "Interesting! Would you like to explore this topic further?",
        "I see. How can I help you with this specifically?"
      ]
    };

    try {
      // Simulate AI response based on message content
      const messageContent = message.content.toLowerCase();
      let responseCategory = 'default';
      
      if (messageContent.includes('hello') || messageContent.includes('hi') || messageContent.includes('hey')) {
        responseCategory = 'greetings';
      } else if (messageContent.includes('?')) {
        responseCategory = 'questions';
      } else if (messageContent.includes('thank')) {
        responseCategory = 'thanks';
      }

      const responses = honorBotResponses[responseCategory];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botResponse = {
        content: randomResponse,
        sender: 'honor-bot',
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
      }, 1000); // Add a small delay to make it feel more natural
    } catch (error) {
      console.error('Error getting bot response:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsHonorBotActive(false);
    setUnreadMessages(prev => ({ ...prev, [user.id]: 0 }));
    setIsDrawerOpen(false);
  };

  const handleHonorBotSelect = () => {
    setIsHonorBotActive(true);
    setSelectedUser(null);
    setIsDrawerOpen(false);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;

    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      members: selectedMembers,
      timestamp: new Date().toISOString()
    };

    setGroups(prev => [...prev, newGroup]);
    setGroupName('');
    setSelectedMembers([]);
    setShowCreateGroup(false);
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Story />
        </Box>

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={() => setShowCreateGroup(true)}
          >
            Create Group
          </Button>
        </Box>

        <List sx={{ flex: 1, overflow: 'auto' }}>
          <ListItem 
            button 
            selected={isHonorBotActive}
            onClick={handleHonorBotSelect}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SmartToyIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary="Honor AI"
              secondary="Your personal assistant"
            />
          </ListItem>

          <Divider />

          {groups.map(group => (
            <ListItem
              key={group.id}
              button
              selected={selectedUser?.id === group.id}
              onClick={() => handleUserSelect(group)}
            >
              <ListItemAvatar>
                <Avatar>{group.name[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={group.name}
                secondary={`${group.members.length} members`}
              />
            </ListItem>
          ))}

          <Divider />

          {users.map(user => (
            <ListItem 
              key={user.id}
              button 
              selected={selectedUser?.id === user.id}
              onClick={() => handleUserSelect(user)}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={user.online ? "success" : "error"}
                >
                  <Avatar>{user.avatar}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText 
                primary={user.name}
                secondary={user.online ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
              />
              {unreadMessages[user.id] > 0 && (
                <Badge badgeContent={unreadMessages[user.id]} color="primary" />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {(selectedUser || isHonorBotActive) ? (
          <>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2 }}>
                {isHonorBotActive ? <SmartToyIcon /> : selectedUser?.name?.[0]}
              </Avatar>
              <Typography variant="h6">
                {isHonorBotActive ? 'Honor AI' : selectedUser?.name}
              </Typography>
              {!isHonorBotActive && selectedUser && (
                <Box sx={{ ml: 'auto' }}>
                  <IconButton>
                    <CallIcon />
                  </IconButton>
                  <IconButton>
                    <VideoCallIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === socket.id ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === socket.id ? 'primary.main' : 'grey.100',
                      color: message.sender === socket.id ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography>{message.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isHonorBotActive ? "Ask Honor anything..." : "Type a message..."}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        )}
      </Box>

      {showCreateGroup && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: 400,
            maxWidth: '90%',
            borderRadius: 1
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Group
          </Typography>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>
            Select Members
          </Typography>
          <List>
            {users.map(user => (
              <ListItem
                key={user.id}
                button
                onClick={() => {
                  setSelectedMembers(prev =>
                    prev.includes(user.id)
                      ? prev.filter(id => id !== user.id)
                      : [...prev, user.id]
                  );
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={selectedMembers.includes(user.id)}
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemAvatar>
                  <Avatar>{user.name?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setShowCreateGroup(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length < 2}
            >
              Create
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chat;