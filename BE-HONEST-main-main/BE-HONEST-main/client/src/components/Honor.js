import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Tooltip,
  CircularProgress,
  Chip,
  Fade
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  VideoCall as VideoCallIcon,
  Call as CallIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachIcon,
  Image as ImageIcon,
  Stop as StopIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import './Honor.css';

const Honor = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const { user } = useAuth();

  const sampleEmojis = ['😊', '😂', '❤️', '😍', '🎉', '👍', '🙌', '🤔', '😮', '😢'];

  useEffect(() => {
    scrollToBottom();
    // Initialize with a greeting
    if (messages.length === 0) {
      setTimeout(() => {
        handleAIResponse('greeting');
      }, 1000);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(false);

    // Simulate AI thinking
    setAiThinking(true);
    setTimeout(() => {
      handleAIResponse(detectIntent(newMessage));
      setAiThinking(false);
    }, 1500);
  };

  const detectIntent = (message) => {
    message = message.toLowerCase();
    if (message.includes('help') && message.includes('project')) return 'project_help';
    if (message.includes('feel') || message.includes('stress') || message.includes('worried')) return 'emotional_support';
    if (message.includes('error') || message.includes('bug') || message.includes('problem')) return 'technical_help';
    return 'general';
  };

  const handleAIResponse = (trigger) => {
    const responses = {
      greeting: [
        "Hello! I'm Honor AI, your personal assistant. How can I help you today? 🤖",
        "Hi there! Ready to assist you with anything you need! 👋",
        "Welcome! What would you like to explore together? 💡"
      ],
      project_help: [
        "I can help you manage your project. Would you like me to create a schedule? 📅",
        "Let's break down your project into manageable tasks. What's your main goal? 🎯",
        "I can suggest some project management tools. Interested? 💼"
      ],
      emotional_support: [
        "I understand this might be challenging. Let's talk about it. 💭",
        "You're doing great! Remember to take breaks and practice self-care. 🌟",
        "I'm here to listen and help you process your thoughts. What's on your mind? 🤗"
      ],
      technical_help: [
        "I can guide you through technical issues. What's the problem? 🔧",
        "Let's troubleshoot together. Can you describe what's happening? 💻",
        "I have access to technical resources. What technology are you using? 🛠️"
      ],
      general: [
        "I'm processing your message. How can I assist you better? 🤔",
        "Interesting! Could you tell me more about that? 💭",
        "I'm here to help. What would you like to focus on? 🎯"
      ]
    };

    const response = {
      id: Date.now(),
      sender: 'ai',
      content: responses[trigger][Math.floor(Math.random() * responses[trigger].length)],
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, response]);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Add actual recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Add logic to process and send audio
  };

  const handleVideoCall = () => {
    setIsVideoCallActive(!isVideoCallActive);
    // Add video call logic
  };

  const handleVoiceCall = () => {
    setIsCallActive(!isCallActive);
    // Add voice call logic
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PsychologyIcon />
          </Avatar>
          <Typography variant="h6">Honor AI Assistant</Typography>
        </Box>
        <Box>
          <Tooltip title="Voice Call">
            <IconButton onClick={handleVoiceCall} color={isCallActive ? 'primary' : 'default'}>
              <CallIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Video Call">
            <IconButton onClick={handleVideoCall} color={isVideoCallActive ? 'primary' : 'default'}>
              <VideoCallIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                gap: 2,
                mb: 2
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main' }}>
                  {message.sender === 'user' ? user?.name?.[0] || 'U' : 'AI'}
                </Avatar>
              </ListItemAvatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.sender === 'user' ? 'primary.light' : 'secondary.light',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </ListItem>
          ))}
          {aiThinking && (
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>AI</Avatar>
              </ListItemAvatar>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography>Thinking...</Typography>
                </Box>
              </Paper>
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Emoji Picker */}
      <Fade in={showEmojis}>
        <Paper
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 16,
            p: 1,
            display: showEmojis ? 'flex' : 'none',
            gap: 1,
            flexWrap: 'wrap',
            maxWidth: 300
          }}
        >
          {sampleEmojis.map((emoji) => (
            <Chip
              key={emoji}
              label={emoji}
              onClick={() => handleEmojiClick(emoji)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Paper>
      </Fade>

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setShowEmojis(!showEmojis)}>
            <EmojiIcon />
          </IconButton>
          <IconButton>
            <AttachIcon />
          </IconButton>
          <IconButton>
            <ImageIcon />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              setIsTyping(true);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{ mx: 1 }}
          />
          {isRecording ? (
            <IconButton color="error" onClick={handleStopRecording}>
              <StopIcon />
            </IconButton>
          ) : (
            <IconButton onClick={handleStartRecording}>
              <MicIcon />
            </IconButton>
          )}
          <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Honor; 