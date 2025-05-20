import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  Tooltip,
  Slide,
  Stack,
  Zoom,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Camera as CameraIcon,
  FlipCameraIos as FlipCameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Videocam as VideocamIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
  Face as FaceIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import './CameraComponent.css';

// Add CSS for filters
const filterStyles = {
  none: '',
  dog: `
    filter: saturate(1.5) contrast(1.2);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('/filters/dog-ears.png') no-repeat center top;
      background-size: contain;
      pointer-events: none;
    }
  `,
  butterfly: `
    filter: brightness(1.2) saturate(1.3);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('/filters/butterfly.png') no-repeat center;
      background-size: cover;
      pointer-events: none;
    }
  `,
  crown: `
    filter: contrast(1.1) brightness(1.1);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('/filters/crown.png') no-repeat center top;
      background-size: 50% auto;
      pointer-events: none;
    }
  `,
  rainbow: `
    filter: saturate(1.4) contrast(1.1);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        rgba(255,0,0,0.1),
        rgba(255,165,0,0.1),
        rgba(255,255,0,0.1),
        rgba(0,128,0,0.1),
        rgba(0,0,255,0.1),
        rgba(75,0,130,0.1),
        rgba(238,130,238,0.1)
      );
      pointer-events: none;
    }
  `
};

const CameraComponent = ({ onClose, onVideoCapture }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [facingMode, setFacingMode] = useState('user');
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const MAX_RECORDING_TIME = 80; // 80 seconds
  const MIN_RECORDING_TIME = 30; // 30 seconds

  const filters = [
    { id: 'none', label: 'Normal', icon: '📷' },
    { id: 'dog', label: 'Dog', icon: '🐶' },
    { id: 'butterfly', label: 'Butterfly', icon: '🦋' },
    { id: 'crown', label: 'Crown', icon: '👑' },
    { id: 'rainbow', label: 'Rainbow', icon: '🌈' }
  ];

  useEffect(() => {
    initializeCamera();
    fetchChatUsers();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      setLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const fetchChatUsers = async () => {
    try {
      const response = await api.get('/api/chats/users');
      setChatUsers(response.data);
    } catch (err) {
      setError('Failed to load chat users');
      console.error('Error fetching chat users:', err);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      if (!selectedUser) {
        setError('Please select a user to send the image to');
        return;
      }

      const formData = new FormData();
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      formData.append('image', blob);
      formData.append('receiverId', selectedUser._id);

      await api.post('/api/messages/send-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onClose();
    } catch (err) {
      setError('Failed to send image');
      console.error('Error sending image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = 'captured-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to save image');
      console.error('Error saving image:', err);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedUser(null);
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (recordingTime < MIN_RECORDING_TIME) {
        alert(`Video must be at least ${MIN_RECORDING_TIME} seconds long`);
        return;
      }
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      onVideoCapture(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const getRecordingProgress = () => (recordingTime / MAX_RECORDING_TIME) * 100;

  const renderUserList = () => (
    <List sx={{ maxHeight: 200, overflow: 'auto' }}>
      {chatUsers.map((user) => (
        <ListItem
          key={user._id}
          button
          selected={selectedUser?._id === user._id}
          onClick={() => setSelectedUser(user)}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            },
          }}
        >
          <ListItemAvatar>
            <Avatar src={user.profilePic} alt={user.username}>
              {user.username[0].toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={user.username} />
        </ListItem>
      ))}
    </List>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={onClose}>Close</Button>
      </Box>
    );
  }

  return (
    <Dialog open fullScreen TransitionComponent={Slide} TransitionProps={{ direction: 'up' }}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Camera</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: '70vh' }}>
          {loading && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              ...filterStyles[selectedFilter],
            }}
          />

          {capturedImage && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  ...filterStyles[selectedFilter],
                }}
              />
            </Box>
          )}

          <Stack
            direction="row"
            spacing={2}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
            }}
          >
            {!capturedImage ? (
              <>
                <Tooltip title="Take Photo">
                  <IconButton
                    color="primary"
                    onClick={handleCapture}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <CameraIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Switch Camera">
                  <IconButton
                    onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <FlipCameraIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Retake">
                  <IconButton
                    onClick={() => setCapturedImage(null)}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Send">
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!selectedUser}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Box>

        {capturedImage && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select user to send to:
            </Typography>
            {renderUserList()}
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
            pb: 1,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'primary.main', borderRadius: 3 },
          }}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              icon={<span>{filter.icon}</span>}
              onClick={() => setSelectedFilter(filter.id)}
              color={selectedFilter === filter.id ? 'primary' : 'default'}
              sx={{ minWidth: 80 }}
            />
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default CameraComponent; 