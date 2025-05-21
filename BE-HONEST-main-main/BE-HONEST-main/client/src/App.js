import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import Accessibility from './components/Accessibility';
import NavigationBar from './components/NavigationBar';
import { analytics } from './services/analytics';
import './styles/accessibility.css';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { FirebaseProvider } from './contexts/FirebaseContext';
import routes from './routes';
import './App.css';

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
                      {routes.map((route, index) => (
                        <Route
                          key={index}
                          path={route.path}
                          element={route.element}
                        />
                      ))}
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

export default App; 