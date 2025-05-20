import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const verifyEmail = async () => {
      const token = location.pathname.split('/').pop();
      if (token && token !== 'verify-email') {
        try {
          setVerifying(true);
          await axios.get(`/api/auth/verify-email/${token}`);
          // Update user data in localStorage
          const updatedUser = { ...user, isEmailVerified: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          navigate('/');
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to verify email');
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyEmail();
  }, [location, navigate, user]);

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      await axios.post('/api/auth/resend-verification', { email: user.email });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5">
            Email Verification
          </Typography>

          {verifying ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Verifying your email...</Typography>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}

              <Typography sx={{ mt: 2, textAlign: 'center' }}>
                Please check your email for a verification link. If you haven't received it, you can request a new one.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 