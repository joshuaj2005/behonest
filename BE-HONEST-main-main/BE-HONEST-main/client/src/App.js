import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { CircularProgress, Box, Typography, Button, Stack } from '@mui/material';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import Accessibility from './components/Accessibility';
import NavigationBar from './components/NavigationBar';
import { analytics } from './services/analytics';
import './styles/accessibility.css';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Games from './pages/Games';
import TicTacToe from './components/TicTacToe';
import ChessGame from './components/Chess';
import Directions from './components/Directions';
import DirectionsMap from './components/DirectionsMap';
import Honor from './components/Honor';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { FirebaseProvider } from './contexts/FirebaseContext';
import AppRoutes from './routes';
import './App.css';

// Lazy load components
const Chat = lazy(() => import('./components/Chat'));
const SnapMap = lazy(() => import('./components/SnapMap'));
const ReelsFeed = lazy(() => import('./components/Reels'));
const CreateReel = lazy(() => import('./components/CreateReel'));
const GameRoom = lazy(() => import('./pages/GameRoom'));
const Chess = lazy(() => import('./components/Chess'));
const Snake = lazy(() => import('./components/Snake'));
const StreakDisplay = lazy(() => import('./components/StreakDisplay'));

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

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}
  >
    <CircularProgress />
  </Box>
);

const App = () => {
  useEffect(() => {
    // Initialize analytics with user ID
    const userId = localStorage.getItem('userId');
    if (userId) {
      analytics.init(userId);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <FirebaseProvider>
              <Router>
                <Box sx={{ pb: 7 }}> {/* Add padding bottom to account for navigation bar */}
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/verify-email/*" element={<VerifyEmail />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      } />
                      <Route path="/chat" element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      } />
                      <Route path="/map" element={
                        <ProtectedRoute>
                          <SnapMap />
                        </ProtectedRoute>
                      } />
                      <Route path="/reels" element={
                        <ProtectedRoute>
                          <ReelsFeed />
                        </ProtectedRoute>
                      } />
                      <Route path="/create-reel" element={
                        <ProtectedRoute>
                          <CreateReel />
                        </ProtectedRoute>
                      } />
                      <Route path="/games" element={
                        <ProtectedRoute>
                          <Games />
                        </ProtectedRoute>
                      } />
                      <Route path="/streaks/:friendId" element={
                        <ProtectedRoute>
                          <StreakDisplay />
                        </ProtectedRoute>
                      } />
                      <Route path="/directions" element={<DirectionsMap />} />
                      <Route path="/honor" element={<Honor />} />
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                    <NavigationBar />
                    <Accessibility />
                  </Suspense>
                </Box>
              </Router>
            </FirebaseProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default App; 