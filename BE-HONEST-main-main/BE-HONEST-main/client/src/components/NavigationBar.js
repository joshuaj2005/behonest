import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  Box,
  Fab
} from '@mui/material';
import {
  Home as HomeIcon,
  Chat as ChatIcon,
  Map as MapIcon,
  VideoLibrary as ReelsIcon,
  SportsEsports as GamesIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Camera as CameraIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import CameraComponent from './CameraComponent';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCameraOpen = () => {
    setIsCameraOpen(true);
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false);
  };

  const navigationItems = isLoggedIn ? [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { label: 'Map', icon: <MapIcon />, path: '/map' },
    { label: 'Reels', icon: <ReelsIcon />, path: '/reels' },
    { label: 'Games', icon: <GamesIcon />, path: '/games' },
    { onClick: handleLogout, icon: <LogoutIcon />, label: 'Logout' }
  ] : [
    { path: '/login', icon: <LoginIcon />, label: 'Login' }
  ];

  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar sx={{ justifyContent: 'space-around', position: 'relative' }}>
          {navigationItems.map((item, index) => (
            <Tooltip key={item.path || index} title={item.label} placement="top">
              <IconButton
                color={isActive(item.path) ? 'secondary' : 'inherit'}
                onClick={item.onClick || (() => navigate(item.path))}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          ))}
          
          {/* Centered Camera FAB */}
          {isLoggedIn && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '-50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Tooltip title="Take Photo/Video" placement="top">
                <Fab
                  color="secondary"
                  onClick={handleCameraOpen}
                  sx={{
                    width: 56,
                    height: 56,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.2s',
                  }}
                >
                  <PhotoCameraIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Dialog
        fullScreen
        open={isCameraOpen}
        onClose={handleCameraClose}
      >
        <DialogContent sx={{ padding: 0, bgcolor: 'black' }}>
          <CameraComponent onClose={handleCameraClose} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NavigationBar; 