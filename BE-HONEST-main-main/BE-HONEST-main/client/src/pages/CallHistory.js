import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Box,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  Call as CallIcon,
  Videocam as VideocamIcon,
  Mic as MicIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  ScreenShare as ScreenShareIcon,
  FiberManualRecord as RecordIcon
} from '@mui/icons-material';
import axios from 'axios';

const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCall, setSelectedCall] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCallHistory();
    fetchRecordings();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const response = await axios.get('/api/calls/history');
      setCalls(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch call history');
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await axios.get('/api/reels/recordings');
      setRecordings(response.data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

  const handleDeleteCall = async (callId) => {
    try {
      await axios.delete(`/api/calls/history/${callId}`);
      setCalls(calls.filter(call => call._id !== callId));
      setShowDeleteDialog(false);
    } catch (error) {
      setError('Failed to delete call');
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const filteredCalls = calls.filter(call => {
    const searchLower = searchQuery.toLowerCase();
    return (
      call.from.username.toLowerCase().includes(searchLower) ||
      call.to.username.toLowerCase().includes(searchLower)
    );
  });

  const filteredRecordings = recordings.filter(recording => {
    const searchLower = searchQuery.toLowerCase();
    return (
      recording.title.toLowerCase().includes(searchLower) ||
      recording.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Call History
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Calls" />
          <Tab label="Recordings" />
        </Tabs>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : tabValue === 0 ? (
          <List>
            {filteredCalls.map((call, index) => (
              <React.Fragment key={call._id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Box>
                      {call.recordingUrl && (
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setSelectedCall(call);
                            setShowRecordingDialog(true);
                          }}
                        >
                          <PlayIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedCall(call);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={call.from.profilePicture}>
                      {call.from.username[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {call.from.username}
                        </Typography>
                        {call.type === 'video' ? (
                          <VideocamIcon fontSize="small" />
                        ) : (
                          <MicIcon fontSize="small" />
                        )}
                        {call.screenShared && (
                          <ScreenShareIcon fontSize="small" />
                        )}
                        {call.recorded && (
                          <RecordIcon fontSize="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(call.startTime)}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatDuration(call.duration)}
                          color={call.status === 'completed' ? 'success' : 'error'}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Grid container spacing={2}>
            {filteredRecordings.map((recording) => (
              <Grid item xs={12} sm={6} key={recording._id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <video
                      src={recording.url}
                      style={{ width: '100%', borderRadius: 4 }}
                      controls
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white'
                      }}
                      onClick={() => {
                        setSelectedCall(recording);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {recording.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recording.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(recording.createdAt)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete {tabValue === 0 ? 'Call' : 'Recording'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {tabValue === 0 ? 'call' : 'recording'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (tabValue === 0) {
                handleDeleteCall(selectedCall?._id);
              } else {
                // Handle recording deletion
              }
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recording Dialog */}
      <Dialog
        open={showRecordingDialog}
        onClose={() => setShowRecordingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Call Recording</DialogTitle>
        <DialogContent>
          {selectedCall?.recordingUrl && (
            <video
              controls
              style={{ width: '100%', maxHeight: '70vh' }}
              src={selectedCall.recordingUrl}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecordingDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CallHistory; 