import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as ReadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('new_notification');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/notifications?page=${page}&limit=10`);
      const { notifications: newNotifications, hasMore: more } = response.data;

      setNotifications(prev => 
        page === 1 ? newNotifications : [...prev, ...newNotifications]
      );
      setHasMore(more);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead([notification._id]);

    // Navigate based on notification type
    switch (notification.type) {
      case 'follow_request':
        navigate(`/profile/${notification.sender._id}`);
        break;
      case 'like':
      case 'comment':
        navigate(`/reel/${notification.relatedId}`);
        break;
      case 'message':
        navigate(`/chat/${notification.relatedId}`);
        break;
      case 'story_view':
        navigate(`/stories/${notification.relatedId}`);
        break;
      default:
        break;
    }
    handleClose();
  };

  const markAsRead = async (notificationIds) => {
    try {
      await axios.post('/api/notifications/mark-read', { notificationIds });
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id)
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n._id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete('/api/notifications', {
        data: { notificationIds: [notificationId] }
      });
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
      if (!notifications.find(n => n._id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete('/api/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchNotifications();
  };

  const getNotificationContent = (notification) => {
    const { type, sender } = notification;
    const username = sender?.username || 'Someone';

    switch (type) {
      case 'follow_request':
        return `${username} sent you a friend request`;
      case 'follow_accept':
        return `${username} accepted your friend request`;
      case 'like':
        return `${username} liked your reel`;
      case 'comment':
        return `${username} commented on your reel`;
      case 'mention':
        return `${username} mentioned you in a comment`;
      case 'story_view':
        return `${username} viewed your story`;
      case 'message':
        return `${username} sent you a message`;
      default:
        return notification.content;
    }
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Box>
            <IconButton size="small" onClick={markAllAsRead}>
              <ReadIcon />
            </IconButton>
            <IconButton size="small" onClick={clearAll}>
              <DeleteIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                navigate('/settings/notifications');
                handleClose();
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography>No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => deleteNotification(notification._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar src={notification.sender?.profilePicture} />
                </ListItemAvatar>
                <ListItemText
                  primary={getNotificationContent(notification)}
                  secondary={new Date(notification.createdAt).toRelativeTimeString()}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {hasMore && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button
              onClick={loadMore}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Load More
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter; 