import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  VideoLibrary as ReelsIcon,
  Map as MapIcon,
  AddCircle as CreateIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import CreateReel from './CreateReel';

const Home = () => {
  const navigate = useNavigate();
  const [openCredits, setOpenCredits] = React.useState(false);
  const [openCreateReel, setOpenCreateReel] = React.useState(false);

  const features = [
    {
      title: 'View Reels',
      description: 'Watch authentic moments from your friends',
      icon: <ReelsIcon sx={{ fontSize: 40 }} />,
      path: '/reels',
      color: '#FF6B6B',
    },
    {
      title: 'Open Map',
      description: 'See where your friends are sharing moments',
      icon: <MapIcon sx={{ fontSize: 40 }} />,
      path: '/map',
      color: '#4ECDC4',
    },
    {
      title: 'Create Reel',
      description: 'Share your authentic moments with friends',
      icon: <CreateIcon sx={{ fontSize: 40 }} />,
      color: '#45B7D1',
      isCreateReel: true
    },
    {
      title: 'Chat',
      description: 'Connect with friends in real-time',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      path: '/chat',
      color: '#96CEB4',
    },
    {
      title: 'Credits',
      description: 'JOSHUA J - IT',
      icon: <InfoIcon sx={{ fontSize: 40 }} />,
      color: '#9B59B6',
      highlight: true,
      isCredits: true
    },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.isCredits) {
      setOpenCredits(true);
    } else if (feature.isCreateReel) {
      setOpenCreateReel(true);
    } else {
      navigate(feature.path);
    }
  };

  const handleCreateReelClose = () => {
    setOpenCreateReel(false);
  };

  const handleReelCreated = (newReel) => {
    setOpenCreateReel(false);
    navigate('/reels');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Welcome to BEE HONEST
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={feature.highlight ? 12 : 8}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: feature.highlight
                  ? `linear-gradient(45deg, ${feature.color}, #8E44AD)`
                  : 'white',
                border: feature.highlight ? '3px solid #9B59B6' : 'none',
                '&:hover': {
                  transform: feature.highlight ? 'scale(1.03)' : 'scale(1.02)',
                  boxShadow: feature.highlight ? 24 : 16,
                },
              }}
              onClick={() => handleFeatureClick(feature)}
            >
              <Box
                sx={{
                  color: feature.highlight ? 'white' : feature.color,
                  transform: feature.highlight ? 'scale(1.4)' : 'scale(1.3)',
                  mb: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: feature.highlight ? 'scale(1.5)' : 'scale(1.4)',
                  },
                }}
              >
                {feature.icon}
              </Box>
              <Typography
                variant="h6"
                component="h2"
                align="center"
                sx={{
                  mb: 1,
                  color: feature.highlight ? 'white' : 'text.primary',
                  fontSize: feature.highlight ? '1.6rem' : '1.5rem',
                  fontWeight: feature.highlight ? 600 : 500,
                  textShadow: feature.highlight ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                align="center"
                sx={{
                  color: feature.highlight ? 'white' : 'text.secondary',
                  fontWeight: feature.highlight ? 500 : 400,
                  fontSize: feature.highlight ? '1.1rem' : '1rem',
                }}
              >
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Credits Dialog */}
      <Dialog
        open={openCredits}
        onClose={() => setOpenCredits(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '2px solid #9B59B6',
            minWidth: 300,
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#9B59B6', 
          color: 'white',
          textAlign: 'center'
        }}>
          Credits
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Developer
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            JOSHUA J
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary">
            Information Technology
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setOpenCredits(false)}
            variant="contained"
            sx={{ 
              bgcolor: '#9B59B6',
              '&:hover': {
                bgcolor: '#8E44AD'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Reel Dialog */}
      <CreateReel
        open={openCreateReel}
        onClose={handleCreateReelClose}
        onReelCreated={handleReelCreated}
      />
    </Container>
  );
};

export default Home; 