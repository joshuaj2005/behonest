import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/auth/current-user');
        setUser(response.data);
        setFormData({
          username: response.data.username,
          bio: response.data.bio || '',
          email: response.data.email,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const response = await api.post('/api/users/profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put('/api/users/profile', formData);
      setUser(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.profilePicture}
              sx={{ width: 100, height: 100 }}
            />
            <input
              accept="image/*"
              type="file"
              id="profile-picture-input"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-picture-input">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
          </Box>
          <Box sx={{ ml: 3, flex: 1 }}>
            <Typography variant="h5">{user?.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <IconButton onClick={() => setEditMode(true)}>
            <EditIcon />
          </IconButton>
        </Box>

        <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: 3 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText primary="Notifications" secondary="Manage notification settings" />
            <Switch />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText primary="Privacy" secondary="Control your privacy settings" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PaletteIcon />
            </ListItemIcon>
            <ListItemText primary="Theme" secondary="Customize your chat appearance" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary="Language" secondary="Choose your preferred language" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & Support" secondary="Get help with BE-HONEST" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings; 