import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  Typography,
  LinearProgress,
  Fab,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  NavigateBefore,
  NavigateNext,
  Close as CloseIcon,
  Image as ImageIcon,
  Videocam as VideoIcon
} from '@mui/icons-material';
import './Story.css';

const Story = () => {
  const [stories, setStories] = useState([
    {
      id: 'your-story',
      user: 'You',
      avatar: 'https://ui-avatars.com/api/?name=You&background=random',
      items: [],
      hasNew: false
    },
    {
      id: 'user1',
      user: 'Sarah',
      avatar: 'https://ui-avatars.com/api/?name=Sarah&background=random',
      items: [
        {
          id: 'story1',
          type: 'image',
          url: 'https://source.unsplash.com/random/800x600?nature',
          timestamp: '2h ago'
        },
        {
          id: 'story2',
          type: 'video',
          url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          timestamp: '1h ago'
        }
      ],
      hasNew: true
    },
    {
      id: 'user2',
      user: 'Mike',
      avatar: 'https://ui-avatars.com/api/?name=Mike&background=random',
      items: [
        {
          id: 'story3',
          type: 'image',
          url: 'https://source.unsplash.com/random/800x600?city',
          timestamp: '30m ago'
        }
      ],
      hasNew: true
    },
    {
      id: 'user3',
      user: 'Emily',
      avatar: 'https://ui-avatars.com/api/?name=Emily&background=random',
      items: [
        {
          id: 'story4',
          type: 'image',
          url: 'https://source.unsplash.com/random/800x600?people',
          timestamp: '15m ago'
        },
        {
          id: 'story5',
          type: 'image',
          url: 'https://source.unsplash.com/random/800x600?food',
          timestamp: '10m ago'
        }
      ],
      hasNew: true
    }
  ]);

  const [selectedStory, setSelectedStory] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);

  const handleStoryClick = (story) => {
    if (story.id === 'your-story' && story.items.length === 0) {
      fileInputRef.current.click();
      return;
    }
    setSelectedStory(story);
    setCurrentItemIndex(0);
    setProgress(0);
    setIsPlaying(true);
    startProgress();
    
    // Mark story as viewed
    if (story.hasNew) {
      setStories(prev => prev.map(s => 
        s.id === story.id ? { ...s, hasNew: false } : s
      ));
    }
  };

  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const story = selectedStory;
    if (!story || !story.items || story.items.length === 0) return;

    const duration = story.items[currentItemIndex].type === 'video' ? 
      document.querySelector('video')?.duration * 1000 || 5000 : 5000;

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);
  };

  const handleClose = () => {
    setSelectedStory(null);
    setCurrentItemIndex(0);
    setProgress(0);
    setIsPlaying(true);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
      startProgress();
    } else if (stories.indexOf(selectedStory) > 0) {
      const prevStory = stories[stories.indexOf(selectedStory) - 1];
      setSelectedStory(prevStory);
      setCurrentItemIndex(prevStory.items.length - 1);
      setProgress(0);
      startProgress();
    }
  };

  const handleNext = () => {
    if (selectedStory.items.length > currentItemIndex + 1) {
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
      startProgress();
    } else if (stories.indexOf(selectedStory) < stories.length - 1) {
      const nextStory = stories[stories.indexOf(selectedStory) + 1];
      setSelectedStory(nextStory);
      setCurrentItemIndex(0);
      setProgress(0);
      startProgress();
    } else {
      handleClose();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please upload only image or video files');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newStory = {
        id: Date.now().toString(),
        type: isVideo ? 'video' : 'image',
        url: e.target.result,
        timestamp: new Date().toLocaleTimeString()
      };

      setStories(prev => {
        const yourStory = prev.find(s => s.id === 'your-story');
        const otherStories = prev.filter(s => s.id !== 'your-story');
        
        return [
          {
            ...yourStory,
            items: [...yourStory.items, newStory],
            hasNew: true
          },
          ...otherStories
        ];
      });

      // Automatically open the story viewer
      setTimeout(() => {
        const updatedYourStory = stories.find(s => s.id === 'your-story');
        if (updatedYourStory) {
          handleStoryClick(updatedYourStory);
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box className="story-container">
      {/* Story Avatars */}
      <Box 
        className="story-avatars"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          gap: 2,
          padding: '16px',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
              background: '#555',
            },
          },
        }}
      >
        {stories.map((story) => (
          <Box
            key={story.id}
            className="story-avatar-container"
            onClick={() => story.id === 'your-story' && story.items.length === 0 ? 
              fileInputRef.current.click() : 
              handleStoryClick(story)}
            sx={{
              minWidth: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                story.id === 'your-story' && story.items.length === 0 ? (
                  <Fab
                    size="small"
                    color="primary"
                    sx={{ width: 24, height: 24, minHeight: 24 }}
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                  </Fab>
                ) : null
              }
            >
              <Avatar
                src={story.avatar}
                sx={{
                  width: 56,
                  height: 56,
                  border: story.hasNew ? '3px solid #1976d2' : '3px solid #ccc'
                }}
              />
            </Badge>
            <Typography 
              variant="caption" 
              align="center" 
              sx={{ 
                mt: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '80px'
              }}
            >
              {story.user}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,video/*"
        onChange={handleFileUpload}
      />

      {/* Story Viewer Dialog */}
      <Dialog
        open={!!selectedStory}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Progress Bar */}
          {selectedStory && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                height: 2
              }}
            />
          )}

          {/* Story Content */}
          {selectedStory && selectedStory.items.length > 0 && (
            <Box
              sx={{
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {/* Navigation Buttons */}
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 8,
                  color: 'white',
                  display: currentItemIndex > 0 || stories.indexOf(selectedStory) > 0 ? 'flex' : 'none'
                }}
              >
                <NavigateBefore />
              </IconButton>

              {/* Story Media */}
              {selectedStory.items[currentItemIndex]?.type === 'video' ? (
                <video
                  src={selectedStory.items[currentItemIndex].url}
                  autoPlay
                  controls={false}
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                  onEnded={handleNext}
                />
              ) : (
                <img
                  src={selectedStory.items[currentItemIndex]?.url}
                  alt="story"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              )}

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  color: 'white',
                  display: currentItemIndex < (selectedStory.items.length - 1) || 
                    stories.indexOf(selectedStory) < stories.length - 1 ? 'flex' : 'none'
                }}
              >
                <NavigateNext />
              </IconButton>
            </Box>
          )}

          {/* Empty Story State */}
          {selectedStory && selectedStory.items.length === 0 && (
            <Box
              sx={{
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Typography variant="h6" gutterBottom>
                No stories yet
              </Typography>
              {selectedStory.id === 'your-story' && (
                <Box sx={{ mt: 2 }}>
                  <IconButton
                    color="primary"
                    onClick={() => fileInputRef.current.click()}
                    sx={{ mr: 1 }}
                  >
                    <ImageIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <VideoIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Story; 