import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  Close,
  AddAPhoto,
  Videocam,
  PhotoLibrary,
  CloudUpload,
  FlipCameraIos
} from '@mui/icons-material';
import axios from 'axios';
import CameraComponent from './CameraComponent';
import './CreateReel.css';

const CreateReel = ({ open, onClose, onReelCreated }) => {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('general');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleCameraOpen = () => {
    setShowCamera(true);
    setError('');
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  const handleVideoFromCamera = (videoBlob) => {
    setVideo(videoBlob);
    setPreview(URL.createObjectURL(videoBlob));
    setShowCamera(false);
    setError('');
  };

  const handleVideoSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('Video size must be less than 100MB');
        return;
      }

      // Create video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      try {
        const promise = new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
          };
          video.onerror = () => {
            reject(new Error('Invalid video file'));
          };
        });

        video.src = URL.createObjectURL(file);
        const duration = await promise;

        if (duration < 30) {
          setError('Video must be at least 30 seconds long');
          return;
        }

        if (duration > 80) {
          setError('Video must be 80 seconds or less');
          return;
        }

        setVideo(file);
        setPreview(URL.createObjectURL(file));
        setError('');
      } catch (err) {
        setError('Invalid video file. Please select a valid video.');
        console.error('Error checking video:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) {
      setError('Please select or record a video');
      return;
    }

    if (!caption.trim()) {
      setError('Please add a caption');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('video', video);
      formData.append('caption', caption);
      formData.append('category', category);
      formData.append('isPublic', isPublic.toString());

      const response = await axios.post('/api/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data) {
        onReelCreated(response.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating reel:', error);
      setError(error.response?.data?.message || 'Failed to create reel. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setVideo(null);
    setPreview('');
    setCaption('');
    setCategory('general');
    setIsPublic(true);
    setError('');
    setActiveTab(0);
    setShowCamera(false);
    setUploadProgress(0);
    onClose();
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create Reel</Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<CloudUpload />} label="Upload" />
          <Tab icon={<Videocam />} label="Record" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            // Upload Tab
            <Box sx={{ textAlign: 'center' }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoLibrary />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                Select Video
              </Button>
            </Box>
          ) : (
            // Record Tab
            <Box sx={{ textAlign: 'center' }}>
              {!showCamera ? (
                <Button
                  variant="contained"
                  startIcon={<Videocam />}
                  onClick={handleCameraOpen}
                  color="primary"
                >
                  Start Recording
                </Button>
              ) : (
                <Box className="camera-container">
                  <CameraComponent
                    onVideoCapture={handleVideoFromCamera}
                    onClose={handleCameraClose}
                    facingMode={facingMode}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color={isRecording ? 'error' : 'primary'}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    <IconButton onClick={handleFlipCamera} color="primary">
                      <FlipCameraIos />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {preview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <video
                src={preview}
                controls
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="gaming">Gaming</MenuItem>
              <MenuItem value="music">Music</MenuItem>
              <MenuItem value="dance">Dance</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="travel">Travel</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label="Make Public"
            sx={{ mt: 1 }}
          />
        </Box>

        {uploadProgress > 0 && (
          <Box sx={{ px: 3, pb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Uploading: {uploadProgress}%
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !video}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Create Reel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReel; 