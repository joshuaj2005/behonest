import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Set up WebSocket listener for new notifications
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('new:notification', handleNewNotification);

    return () => {
      socket.off('new:notification');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    showSnackbar(notification);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification._id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'chat':
        navigate(`/chat/${notification.senderId}`);
        break;
      case 'streak':
        navigate(`/streaks/${notification.senderId}`);
        break;
      case 'game':
        navigate(`/game/${notification.gameId}`);
        break;
      case 'reel':
        navigate('/reels');
        break;
      default:
        break;
    }

    handleClose();
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (notification) => {
    setSnackbar({
      open: true,
      message: notification.message,
      severity: getNotificationSeverity(notification.type)
    });
  };

  const getNotificationSeverity = (type) => {
    switch (type) {
      case 'streak':
        return 'warning';
      case 'game':
        return 'info';
      case 'chat':
        return 'success';
      default:
        return 'info';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return <ChatIcon />;
      case 'streak':
        return <FireIcon />;
      case 'game':
        return <TrophyIcon />;
      case 'reel':
        return <PersonIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
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
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={markAllAsRead}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              />
            </MenuItem>
          ))
        )}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationSystem; 