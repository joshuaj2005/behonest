import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import './HonorBot.css';

const HonorBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Honor, your AI assistant. How can I help you today?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "I'm processing your request. This is a simulated response.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box className="honor-bot-container">
      <Box className="honor-bot-header">
        <Avatar className="bot-avatar">
          <BotIcon />
        </Avatar>
        <Typography variant="h6">Honor AI Assistant</Typography>
      </Box>

      <Box className="honor-bot-messages">
        {messages.map((message) => (
          <Box
            key={message.id}
            className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            {message.sender === 'bot' && (
              <Avatar className="message-avatar">
                <BotIcon />
              </Avatar>
            )}
            <Paper className="message-content">
              <Typography>{message.text}</Typography>
            </Paper>
          </Box>
        ))}
        {isTyping && (
          <Box className="typing-indicator">
            <CircularProgress size={20} />
            <Typography variant="caption">Honor is typing...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box className="honor-bot-input">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!input.trim() || isTyping}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default HonorBot; 