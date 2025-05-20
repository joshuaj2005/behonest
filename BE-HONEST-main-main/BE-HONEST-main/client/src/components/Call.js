import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon
} from '@mui/icons-material';
import webrtcService from '../services/webrtcService';

const Call = ({ call, onEndCall, isIncoming = false }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showIncomingCallDialog, setShowIncomingCallDialog] = useState(isIncoming);

  useEffect(() => {
    if (call) {
      setupCall();
    }

    return () => {
      webrtcService.endCall();
    };
  }, [call]);

  const setupCall = async () => {
    try {
      setIsConnecting(true);
      
      // Set up callbacks
      webrtcService.setCallbacks({
        onRemoteStream: (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setIsConnecting(false);
        },
        onCallEnded: () => {
          onEndCall();
        },
        onCallAccepted: () => {
          setIsConnecting(false);
        },
        onCallRejected: () => {
          onEndCall();
        }
      });

      if (isIncoming) {
        // Handle incoming call
        const localStream = await webrtcService.handleOffer(call);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } else {
        // Start outgoing call
        const localStream = await webrtcService.startCall(call.to.id, call.type === 'video');
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    } catch (error) {
      console.error('Error setting up call:', error);
      onEndCall();
    }
  };

  const handleAcceptCall = () => {
    setShowIncomingCallDialog(false);
    webrtcService.acceptCall();
  };

  const handleRejectCall = () => {
    setShowIncomingCallDialog(false);
    webrtcService.rejectCall();
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    webrtcService.toggleVideo(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    webrtcService.toggleAudio(!isAudioEnabled);
  };

  const handleEndCall = () => {
    webrtcService.endCall();
    onEndCall();
  };

  return (
    <>
      <Dialog
        open={showIncomingCallDialog}
        onClose={handleRejectCall}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Incoming Call</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              src={call.from.profilePicture}
              alt={call.from.username}
              sx={{ width: 60, height: 60 }}
            />
            <Typography variant="h6">{call.from.username}</Typography>
          </Box>
          <Typography>
            {call.type === 'video' ? 'Video' : 'Audio'} call from {call.from.username}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCall} color="error">
            Reject
          </Button>
          <Button onClick={handleAcceptCall} color="primary" variant="contained">
            Accept
          </Button>
        </DialogActions>
      </Dialog>

      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 1000
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={call.from.profilePicture}
            alt={call.from.username}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="subtitle1">{call.from.username}</Typography>
          {isConnecting && <CircularProgress size={20} />}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            onClick={toggleAudio}
            color={isAudioEnabled ? 'primary' : 'error'}
            size="large"
          >
            {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>

          {call.type === 'video' && (
            <IconButton
              onClick={toggleVideo}
              color={isVideoEnabled ? 'primary' : 'error'}
              size="large"
            >
              {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          )}

          <IconButton
            onClick={handleEndCall}
            color="error"
            size="large"
          >
            <CallEndIcon />
          </IconButton>
        </Box>

        {call.type === 'video' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 150,
                bgcolor: 'black',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box
              sx={{
                width: 200,
                height: 150,
                bgcolor: 'black',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default Call; 