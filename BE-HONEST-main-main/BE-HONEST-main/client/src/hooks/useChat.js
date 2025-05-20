import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { emit, on, off } = useSocket();

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/chats/${chatId}/messages`);
      setMessages(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async (content, type = 'text', reelData = null, location = null) => {
    try {
      const messageData = {
        chatId,
        content,
        type,
        reelData,
        location
      };

      const response = await emit('send_message', messageData);
      setMessages(prev => [...prev, response]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [chatId, emit]);

  const markAsRead = useCallback(async (messageIds) => {
    try {
      await emit('mark_read', { chatId, messageIds });
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, read: true } 
            : msg
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }, [chatId, emit]);

  const startTyping = useCallback(() => {
    emit('typing_start', { chatId });
  }, [chatId, emit]);

  const stopTyping = useCallback(() => {
    emit('typing_end', { chatId });
  }, [chatId, emit]);

  useEffect(() => {
    if (!chatId) return;

    fetchMessages();

    // Listen for new messages
    const handleNewMessage = (message) => {
      if (message.chat === chatId) {
        setMessages(prev => [...prev, message]);
      }
    };

    // Listen for typing status
    const handleTypingStart = ({ userId }) => {
      setTypingUsers(prev => new Set([...prev, userId]));
    };

    const handleTypingEnd = ({ userId }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Listen for read receipts
    const handleMessageRead = ({ messageIds }) => {
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, read: true } 
            : msg
        )
      );
    };

    on('new_message', handleNewMessage);
    on('typing_start', handleTypingStart);
    on('typing_end', handleTypingEnd);
    on('message_read', handleMessageRead);

    return () => {
      off('new_message', handleNewMessage);
      off('typing_start', handleTypingStart);
      off('typing_end', handleTypingEnd);
      off('message_read', handleMessageRead);
    };
  }, [chatId, on, off, fetchMessages]);

  return {
    messages,
    loading,
    error,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    refresh: fetchMessages
  };
}; 