import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AccessibilityNew as AccessibilityIcon,
  Keyboard as KeyboardIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const Accessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    // Load saved preferences
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedShowFocus = localStorage.getItem('showFocus') === 'true';
    
    setHighContrast(savedHighContrast);
    setShowFocus(savedShowFocus);
    
    if (savedHighContrast) {
      document.body.classList.add('high-contrast');
    }
    if (savedShowFocus) {
      document.body.classList.add('show-focus');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue);
    
    if (newValue) {
      document.body.classList.add('high-contrast');
      setSnackbar({
        open: true,
        message: 'High contrast mode enabled',
        severity: 'success'
      });
    } else {
      document.body.classList.remove('high-contrast');
      setSnackbar({
        open: true,
        message: 'High contrast mode disabled',
        severity: 'info'
      });
    }
  };

  const toggleShowFocus = () => {
    const newValue = !showFocus;
    setShowFocus(newValue);
    localStorage.setItem('showFocus', newValue);
    
    if (newValue) {
      document.body.classList.add('show-focus');
      setSnackbar({
        open: true,
        message: 'Focus indicators enabled',
        severity: 'success'
      });
    } else {
      document.body.classList.remove('show-focus');
      setSnackbar({
        open: true,
        message: 'Focus indicators disabled',
        severity: 'info'
      });
    }
  };

  const handleKeyPress = (event) => {
    // Skip to main content
    if (event.key === 'Tab' && event.shiftKey) {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.focus();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Tooltip title="Toggle High Contrast">
          <IconButton
            onClick={toggleHighContrast}
            color={highContrast ? 'primary' : 'default'}
            aria-label="Toggle high contrast mode"
          >
            <AccessibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle Focus Indicators">
          <IconButton
            onClick={toggleShowFocus}
            color={showFocus ? 'primary' : 'default'}
            aria-label="Toggle focus indicators"
          >
            <KeyboardIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default Accessibility; 