import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Typography,
  Avatar,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';

const StoryViewer = ({ stories, initialStoryIndex = 0, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const progressInterval = useRef(null);
  const mediaRef = useRef(null);
  const socket = useSocket();

  const currentStory = stories[currentStoryIndex];
  const storyDuration = 5000; // 5 seconds per story

  useEffect(() => {
    if (!currentStory) return;

    // Reset progress when story changes
    setProgress(0);
    setIsLoading(true);

    // Clear previous interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // Start progress
    if (!isPaused) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + (100 / (storyDuration / 100));
        });
      }, 100);
    }

    // Notify server about story view
    socket.emit('view_story', { storyId: currentStory._id });
    axios.post(`/api/stories/${currentStory._id}/view`);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStory, isPaused]);

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (mediaRef.current) {
      if (isPaused) {
        mediaRef.current.play();
      } else {
        mediaRef.current.pause();
      }
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: 'black'
        }
      }}
    >
      <DialogContent
        sx={{
          padding: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Progress bar */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={2}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 2,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }}
          />
        </Box>

        {/* Header */}
        <Box
          position="absolute"
          top={16}
          left={16}
          right={16}
          display="flex"
          alignItems="center"
          zIndex={2}
        >
          <Avatar
            src={currentStory.user.profilePicture}
            sx={{ width: 40, height: 40, marginRight: 2 }}
          />
          <Typography color="white" variant="subtitle1">
            {currentStory.user.username}
          </Typography>
          <Typography
            color="rgba(255,255,255,0.7)"
            variant="caption"
            sx={{ marginLeft: 1 }}
          >
            {new Date(currentStory.createdAt).toRelativeTimeString()}
          </Typography>
        </Box>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            zIndex: 2
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Media content */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {currentStory.mediaType === 'image' ? (
            <img
              ref={mediaRef}
              src={currentStory.mediaUrl}
              alt="Story"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onLoad={handleMediaLoad}
            />
          ) : (
            <video
              ref={mediaRef}
              src={currentStory.mediaUrl}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              autoPlay
              playsInline
              onLoadedData={handleMediaLoad}
              onEnded={handleNextStory}
            />
          )}
        </Box>

        {/* Navigation buttons */}
        <Box
          position="absolute"
          left={0}
          right={0}
          top="50%"
          display="flex"
          justifyContent="space-between"
          px={2}
          sx={{ transform: 'translateY(-50%)' }}
        >
          <IconButton
            onClick={handlePrevStory}
            disabled={currentStoryIndex === 0}
            sx={{ color: 'white' }}
          >
            <PrevIcon />
          </IconButton>
          <IconButton
            onClick={handleNextStory}
            disabled={currentStoryIndex === stories.length - 1}
            sx={{ color: 'white' }}
          >
            <NextIcon />
          </IconButton>
        </Box>

        {/* Play/Pause button */}
        <IconButton
          onClick={togglePause}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: 'white'
          }}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer; 