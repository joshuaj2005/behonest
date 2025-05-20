import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import '../styles/StreakDisplay.css';

const StreakDisplay = ({ friendId }) => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, [friendId]);

  const fetchStreakData = async () => {
    try {
      const response = await axios.get(`/api/snaps/streaks/${friendId}`);
      setStreakData(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch streak data');
      setLoading(false);
    }
  };

  const renderStreakIcon = (days) => {
    if (days >= 100) return <FireIcon sx={{ color: '#ff0000', fontSize: 40 }} />;
    if (days >= 50) return <FireIcon sx={{ color: '#ff6b00', fontSize: 35 }} />;
    if (days >= 25) return <FireIcon sx={{ color: '#ffa500', fontSize: 30 }} />;
    return <FireIcon sx={{ color: '#ffd700', fontSize: 25 }} />;
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="error-container">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper className="streak-container">
      <Box className="streak-header">
        <Typography variant="h6">Streak Details</Typography>
        <IconButton onClick={() => setShowHistory(!showHistory)}>
          <TimelineIcon />
        </IconButton>
      </Box>

      <Box className="streak-count">
        <Box className={`streak-icon ${getStreakIconClass(streakData.currentStreak)}`}>
          <FireIcon />
        </Box>
        <Box className="streak-number">
          <Typography variant="h4">{streakData.currentStreak}</Typography>
          <Typography>Day Streak</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List className="streak-list">
        <ListItem className="streak-list-item">
          <ListItemIcon className="streak-list-icon warning">
            <TrophyIcon />
          </ListItemIcon>
          <ListItemText
            className="streak-list-text"
            primary="Longest Streak"
            secondary={`${streakData.longestStreak} days`}
          />
        </ListItem>

        <ListItem className="streak-list-item">
          <ListItemIcon className="streak-list-icon warning">
            <FireIcon />
          </ListItemIcon>
          <ListItemText
            className="streak-list-text"
            primary="Current Status"
            secondary={streakData.status === 'active' ? 'Active' : 'Broken'}
          />
        </ListItem>

        <ListItem className="streak-list-item">
          <ListItemIcon className="streak-list-icon info">
            <InfoIcon />
          </ListItemIcon>
          <ListItemText
            className="streak-list-text"
            primary="Last Interaction"
            secondary={new Date(streakData.lastInteraction).toLocaleDateString()}
          />
        </ListItem>
      </List>

      {showHistory && streakData.streakHistory.length > 0 && (
        <Box className="streak-history">
          <Box className="streak-history-header">
            <Typography variant="subtitle1">Streak History</Typography>
          </Box>
          <List className="streak-history-list">
            {streakData.streakHistory.map((streak, index) => (
              <React.Fragment key={index}>
                <ListItem className="streak-history-item">
                  <ListItemIcon className="streak-history-icon">
                    <FireIcon />
                  </ListItemIcon>
                  <ListItemText
                    className="streak-history-text"
                    primary={`${streak.duration} days`}
                    secondary={`${new Date(streak.startDate).toLocaleDateString()} - ${new Date(streak.endDate).toLocaleDateString()}`}
                  />
                </ListItem>
                {index < streakData.streakHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {streakData.status === 'broken' && (
        <Box className="streak-warning">
          <FireIcon className="streak-warning-icon" />
          <Typography>
            Streak was broken. Start sending snaps to rebuild your streak!
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const getStreakIconClass = (days) => {
  if (days >= 100) return 'red';
  if (days >= 50) return 'orange';
  if (days >= 25) return 'yellow';
  return 'gold';
};

export default StreakDisplay; 