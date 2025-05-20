import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  IconButton,
  Typography,
  Slider,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  HighQuality,
  Speed,
} from '@mui/icons-material';
import './Reels.css';

// Sample video data
const SAMPLE_VIDEOS = Array(20).fill().map((_, index) => ({
  id: index + 1,
  url: `https://example.com/video${index + 1}.mp4`, // Replace with actual video URLs
  caption: `Sample Reel #${index + 1}`,
  likes: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 100),
  shares: Math.floor(Math.random() * 50),
    user: {
    name: `User ${index + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
  }
}));

const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentReel, setCurrentReel] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState('auto');
  const [speed, setSpeed] = useState(1);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likedReels, setLikedReels] = useState(new Set());
  
  const videoRef = useRef(null);
  const observer = useRef(null);

  // Fetch reels with pagination
  const fetchReels = async () => {
    setLoading(true);
    try {
      // Simulate API call with sample data
      const startIndex = (page - 1) * 5;
      const endIndex = startIndex + 5;
      const newReels = SAMPLE_VIDEOS.slice(startIndex, endIndex);
      
      setReels(prev => [...prev, ...newReels]);
      setHasMore(endIndex < SAMPLE_VIDEOS.length);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, [page]);

  // Intersection Observer for infinite scroll
  const lastReelRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Video control handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
      setIsMuted(newValue === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) {
        setVolume(videoRef.current.volume);
      }
    }
  };

  const handleQualityChange = (event) => {
    setQuality(event.target.value);
    // Implement quality change logic here
  };

  const handleSpeedChange = (event) => {
    const newSpeed = event.target.value;
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleProgressChange = (event, newValue) => {
    if (videoRef.current) {
      const time = (newValue / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(newValue);
    }
  };

  const handleLike = (reelId) => {
    setLikedReels(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(reelId)) {
        newLiked.delete(reelId);
      } else {
        newLiked.add(reelId);
      }
      return newLiked;
    });
  };

  const handleShare = (reel) => {
    setCurrentReel(reel);
    setShareDialogOpen(true);
  };

  const handleComment = (reel) => {
    setCurrentReel(reel);
    setCommentDialogOpen(true);
  };

  const handleSubmitComment = () => {
    // Implement comment submission logic here
    console.log('Comment submitted:', commentText);
    setCommentText('');
    setCommentDialogOpen(false);
  };

  // Render video controls
  const renderVideoControls = (reel) => (
    <Box className="video-controls">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <IconButton onClick={handlePlayPause} color="primary">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Box display="flex" alignItems="center" flex={1} mx={2}>
          <IconButton onClick={handleMuteToggle} color="primary">
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            sx={{ width: 100, mx: 2 }}
          />
        </Box>

        <Select
          value={quality}
          onChange={handleQualityChange}
          size="small"
          sx={{ mr: 1 }}
        >
          <MenuItem value="auto">Auto</MenuItem>
          <MenuItem value="1080p">1080p</MenuItem>
          <MenuItem value="720p">720p</MenuItem>
          <MenuItem value="480p">480p</MenuItem>
        </Select>

        <Select
          value={speed}
          onChange={handleSpeedChange}
          size="small"
        >
          <MenuItem value={0.5}>0.5x</MenuItem>
          <MenuItem value={1}>1x</MenuItem>
          <MenuItem value={1.5}>1.5x</MenuItem>
          <MenuItem value={2}>2x</MenuItem>
        </Select>
      </Box>

      <Slider
        value={progress}
        onChange={handleProgressChange}
        sx={{ width: '100%' }}
      />
    </Box>
  );

  // Render reels
    return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      {reels.map((reel, index) => (
        <Card
          key={reel.id}
          className="reel-card"
          ref={index === reels.length - 1 ? lastReelRef : null}
        >
          <Box position="relative">
            <video
              ref={videoRef}
              src={reel.url}
              onTimeUpdate={handleTimeUpdate}
              style={{ width: '100%', borderRadius: 8 }}
            />
            {renderVideoControls(reel)}
            <Typography className="video-quality-badge">
              {quality}
            </Typography>
            <Typography className="video-speed-badge">
              {speed}x
                </Typography>
                </Box>

          <Box p={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <IconButton
                  className={`like-button ${likedReels.has(reel.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(reel.id)}
                >
                  {likedReels.has(reel.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {reel.likes + (likedReels.has(reel.id) ? 1 : 0)}
                </Typography>
              </Box>

              <IconButton onClick={() => handleComment(reel)}>
                <Comment />
              </IconButton>

              <IconButton onClick={() => handleShare(reel)}>
                <Share />
              </IconButton>
            </Box>

            <Typography variant="body1" mt={1}>
              {reel.caption}
            </Typography>
          </Box>
        </Card>
      ))}

      {loading && (
        <Box textAlign="center" py={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Reel</DialogTitle>
        <DialogContent>
          <Typography>Share this reel with your friends!</Typography>
          {/* Add share options here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your comment"
            fullWidth
            multiline
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitComment} color="primary">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReelsFeed; 