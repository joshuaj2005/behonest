import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Games from '../pages/Games';
import DirectionsMap from '../components/DirectionsMap';
import Honor from '../components/Honor';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load components
const Chat = React.lazy(() => import('../components/Chat'));
const SnapMap = React.lazy(() => import('../components/SnapMap'));
const ReelsFeed = React.lazy(() => import('../components/Reels'));
const CreateReel = React.lazy(() => import('../components/CreateReel'));
const StreakDisplay = React.lazy(() => import('../components/StreakDisplay'));

// Home component
const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
        gap: 4
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to BEE HONEST
      </Typography>
      <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
        A Social Media App for Authentic Connections
      </Typography>
      
      <Stack spacing={2} sx={{ mt: 4, width: '100%', maxWidth: 300 }}>
        {!isLoggedIn && (
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/login')}
            fullWidth
          >
            Login
          </Button>
        )}
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/reels')}
          fullWidth
        >
          View Reels
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/map')}
          fullWidth
        >
          Open Map
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/create-reel')}
          fullWidth
        >
          Create Reel
        </Button>
      </Stack>
    </Box>
  );
};

const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/verify-email/*',
    element: <VerifyEmail />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />
  },
  {
    path: '/',
    element: <ProtectedRoute><Home /></ProtectedRoute>
  },
  {
    path: '/chat',
    element: <ProtectedRoute><Chat /></ProtectedRoute>
  },
  {
    path: '/map',
    element: <ProtectedRoute><SnapMap /></ProtectedRoute>
  },
  {
    path: '/reels',
    element: <ProtectedRoute><ReelsFeed /></ProtectedRoute>
  },
  {
    path: '/create-reel',
    element: <ProtectedRoute><CreateReel /></ProtectedRoute>
  },
  {
    path: '/games',
    element: <ProtectedRoute><Games /></ProtectedRoute>
  },
  {
    path: '/streaks/:friendId',
    element: <ProtectedRoute><StreakDisplay /></ProtectedRoute>
  },
  {
    path: '/directions',
    element: <DirectionsMap />
  },
  {
    path: '/honor',
    element: <Honor />
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
];

export default routes; 