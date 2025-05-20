import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import './Reels.css';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🎬' },
  { id: 'funny', label: 'Funny', icon: '😂' },
  { id: 'educational', label: 'Educational', icon: '📚' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' }
];

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const videoRefs = useRef({});
  const [selectedReel, setSelectedReel] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [videoControls, setVideoControls] = useState({});

  // Updated sample video URLs with more variety and categories
  const sampleVideoUrls = [
    {
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      category: 'funny'
    },
    {
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      category: 'educational'
    },
    {
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg'
    },
    {
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg'
    },
    {
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg'
    }
  ];

  const initVideoControls = (reelId) => {
    if (!videoControls[reelId]) {
      setVideoControls(prev => ({
        ...prev,
        [reelId]: {
          isPlaying: false,
          volume: 1,
          isMuted: false,
          quality: '720p',
          playbackSpeed: 1,
          showControls: false
        }
      }));
    }
  };

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const newReels = Array(20).fill(null).map((_, index) => {
        const categoryIndex = index % CATEGORIES.length;
        return {
          _id: `sample-${page}-${index}`,
          videoUrl: sampleVideoUrls[index % sampleVideoUrls.length].url,
          thumbnail: sampleVideoUrls[index % sampleVideoUrls.length].thumbnail,
          caption: `Sample Reel ${(page - 1) * 20 + index + 1}`,
          user: {
            username: `user_${index}`,
            avatar: `https://mui.com/static/images/avatar/${(index % 8) + 1}.jpg`
          },
          likes: Math.floor(Math.random() * 1000),
          comments: [],
          category: CATEGORIES[categoryIndex].id,
          isLiked: false
        };
      });

      setReels(prev => [...prev, ...newReels]);
      setHasMore(page < 2);
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError('Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Filter reels based on selected category
  const filteredReels = reels.filter(reel => 
    selectedCategory === 'all' || reel.category === selectedCategory
  );

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    // Reset page when category changes
    setPage(1);
    setReels([]);
    setHasMore(true);
  };

  const handleVideoPlay = useCallback((reelId) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    setVideoControls(prev => ({
      ...prev,
      [reelId]: {
        ...prev[reelId],
        isPlaying: !prev[reelId].isPlaying
      }
    }));

    if (video.paused) {
      video.play();
      // Pause all other videos
      Object.entries(videoRefs.current).forEach(([id, v]) => {
        if (id !== reelId && !v.paused) {
          v.pause();
          setVideoControls(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              isPlaying: false
            }
          }));
        }
      });
    } else {
      video.pause();
    }
  }, []);

  const handleVolumeChange = useCallback((reelId, value) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    video.volume = value;
    setVideoControls(prev => ({
      ...prev,
      [reelId]: {
        ...prev[reelId],
        volume: value,
        isMuted: value === 0
      }
    }));
  }, []);

  const handleQualityChange = useCallback((reelId, quality) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    const currentTime = video.currentTime;
    const isPaused = video.paused;

    setVideoControls(prev => ({
      ...prev,
      [reelId]: {
        ...prev[reelId],
        quality
      }
    }));

    // Update video source and restore playback state
    video.src = reels.find(r => r._id === reelId)?.videoUrl;
    video.currentTime = currentTime;
    if (!isPaused) video.play();
  }, [reels]);

  const handleSpeedChange = useCallback((reelId, speed) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    video.playbackRate = speed;
    setVideoControls(prev => ({
      ...prev,
      [reelId]: {
        ...prev[reelId],
        playbackSpeed: speed
      }
    }));
  }, []);

  const handleLike = useCallback((reelId) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel._id === reelId
          ? { ...reel, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1, isLiked: !reel.isLiked }
          : reel
      )
    );
  }, []);

  const handleShare = useCallback((reel) => {
    setSelectedReel(reel);
    setShareDialogOpen(true);
  }, []);

  const handleComment = useCallback((reel) => {
    setSelectedReel(reel);
    setCommentDialogOpen(true);
  }, []);

  const handleSubmitComment = useCallback(() => {
    if (!comment.trim()) return;

    setReels(prevReels =>
      prevReels.map(reel =>
        reel._id === selectedReel._id
          ? {
              ...reel,
              comments: [...reel.comments, { text: comment, user: 'Current User', timestamp: new Date() }]
            }
          : reel
      )
    );

    setComment('');
    setCommentDialogOpen(false);
    setSnackbarMessage('Comment added successfully');
    setSnackbarOpen(true);
  }, [comment, selectedReel]);

  const handleSharePlatform = useCallback((platform) => {
    // Implement actual sharing logic here
    setShareDialogOpen(false);
    setSnackbarMessage(`Shared on ${platform}`);
    setSnackbarOpen(true);
  }, []);

  const handleCopyLink = useCallback(() => {
    if (selectedReel) {
      navigator.clipboard.writeText(`https://yourdomain.com/reels/${selectedReel._id}`);
      setShareDialogOpen(false);
      setSnackbarMessage('Link copied to clipboard');
      setSnackbarOpen(true);
    }
  }, [selectedReel]);

  const handleVideoInView = useCallback((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      const reelId = video.dataset.reelId;

      if (entry.isIntersecting) {
        // Only try to play if the video is loaded
        if (video.readyState >= 3) {
          video.play().catch(err => console.error('Video play error:', err));
          setVideoControls(prev => ({
            ...prev,
            [reelId]: {
              ...prev[reelId],
              isPlaying: true
            }
          }));
        }
      } else {
        video.pause();
        setVideoControls(prev => ({
          ...prev,
          [reelId]: {
            ...prev[reelId],
            isPlaying: false
          }
        }));
      }
    });
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7,
    };

    const observer = new IntersectionObserver(handleVideoInView, options);
    const currentVideoRefs = videoRefs.current;

    Object.values(currentVideoRefs).forEach(video => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      Object.values(currentVideoRefs).forEach(video => {
        if (video) {
          observer.unobserve(video);
        }
      });
    };
  }, [handleVideoInView, reels]);

  const handleVideoError = useCallback((reelId) => {
    console.error(`Error loading video for reel ${reelId}`);
    const video = videoRefs.current[reelId];
    if (video) {
      // Try loading a different format or fallback video
      const fallbackUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      if (video.src !== fallbackUrl) {
        video.src = fallbackUrl;
        video.load(); // Force reload with new source
      }
    }
  }, []);

  const renderReel = useCallback((reel) => {
    initVideoControls(reel._id);
    const controls = videoControls[reel._id] || {};

    return (
      <Card key={reel._id} sx={{ mb: 2, maxWidth: 500, mx: 'auto', borderRadius: 2, overflow: 'hidden' }}>
        <CardHeader
          avatar={
            <Avatar src={reel.user.avatar} alt={reel.user.username}>
              {reel.user.username[0]}
            </Avatar>
          }
          title={reel.user.username}
          subheader={reel.caption}
        />
        
        <Box sx={{ position: 'relative', paddingTop: '177.77%', bgcolor: 'black' }}>
          <Box
            component="video"
            src={reel.videoUrl}
            poster={reel.thumbnail}
            ref={el => {
              if (el) {
                videoRefs.current[reel._id] = el;
                el.dataset.reelId = reel._id;
                el.preload = "auto";
              }
            }}
            onError={() => handleVideoError(reel._id)}
            onLoadedData={(e) => {
              const video = e.target;
              if (video && video.readyState >= 3) {
                video.play().catch(err => console.error('Error playing video:', err));
              }
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000',
              '&::-webkit-media-controls': {
                display: 'none !important'
              }
            }}
            loop
            playsInline
            muted={controls.isMuted}
            controls={false}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <IconButton
              onClick={() => handleVideoPlay(reel._id)}
              sx={{ color: 'white' }}
            >
              {controls.isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton
              onClick={() => handleVolumeChange(reel._id, controls.isMuted ? 1 : 0)}
              sx={{ color: 'white' }}
            >
              {controls.isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
          </Box>
        </Box>

        <CardActions>
          <IconButton onClick={() => handleLike(reel._id)}>
            {reel.isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2">{reel.likes} likes</Typography>
          <IconButton onClick={() => handleComment(reel._id)}>
            <CommentIcon />
          </IconButton>
          <IconButton onClick={() => handleShare(reel._id)}>
            <ShareIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }, [videoControls, handleVideoPlay, handleVolumeChange, handleLike, handleComment, handleShare, initVideoControls]);

  return (
    <Container maxWidth="sm" sx={{ pb: 7 }}>
      {/* Category Filter */}
      <Box sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, py: 1 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="reel categories"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2,
              py: 1,
              borderRadius: '20px',
              mr: 1,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'primary.light',
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          {CATEGORIES.map((category) => (
            <Tab
              key={category.id}
              value={category.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Reels Feed */}
      <InfiniteScroll
        dataLength={filteredReels.length}
        next={() => setPage(prev => prev + 1)}
        hasMore={hasMore}
        loader={<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>}
      >
        {filteredReels.map(reel => renderReel(reel))}
      </InfiniteScroll>

      {loading && filteredReels.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Reel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <IconButton onClick={() => handleSharePlatform('Facebook')} color="primary">
              <FacebookIcon />
            </IconButton>
            <IconButton onClick={() => handleSharePlatform('Twitter')} color="primary">
              <TwitterIcon />
            </IconButton>
            <IconButton onClick={() => handleSharePlatform('WhatsApp')} color="primary">
              <WhatsAppIcon />
            </IconButton>
            <IconButton onClick={() => handleSharePlatform('Telegram')} color="primary">
              <TelegramIcon />
            </IconButton>
            <IconButton onClick={handleCopyLink} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your comment"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitComment} variant="contained">
            Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setMenuAnchorEl(null);
          // Add report functionality
          setSnackbarMessage('Reel reported');
          setSnackbarOpen(true);
        }}>
          Report
        </MenuItem>
        <MenuItem onClick={() => {
          setMenuAnchorEl(null);
          // Add save functionality
          setSnackbarMessage('Reel saved');
          setSnackbarOpen(true);
        }}>
          Save
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Reels; 