import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { on, off } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.post('/api/notifications/mark-read', { notificationId });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.post('/api/notifications/mark-read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => 
        notifications.find(n => n._id === notificationId && !n.read) 
          ? Math.max(0, prev - 1) 
          : prev
      );
    } catch (err) {
      setError(err.message);
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      await axios.delete('/api/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    on('notification', handleNewNotification);

    return () => {
      off('notification', handleNewNotification);
    };
  }, [on, off, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetchNotifications
  };
}; 