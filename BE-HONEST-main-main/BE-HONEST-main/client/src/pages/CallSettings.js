import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  TextField,
  Button,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';

const CallSettings = () => {
  const [settings, setSettings] = useState({
    allowIncomingCalls: true,
    allowVideoCalls: true,
    doNotDisturb: false,
    doNotDisturbSchedule: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/calls/settings');
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch call settings');
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, checked, value } = event.target;
    if (name.startsWith('doNotDisturbSchedule.')) {
      const scheduleField = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        doNotDisturbSchedule: {
          ...prev.doNotDisturbSchedule,
          [scheduleField]: value || checked
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: checked !== undefined ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/calls/settings', settings);
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Call Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowIncomingCalls}
                  onChange={handleChange}
                  name="allowIncomingCalls"
                />
              }
              label="Allow incoming calls"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowVideoCalls}
                  onChange={handleChange}
                  name="allowVideoCalls"
                />
              }
              label="Allow video calls"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Do Not Disturb
          </Typography>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.doNotDisturb}
                  onChange={handleChange}
                  name="doNotDisturb"
                />
              }
              label="Enable Do Not Disturb"
            />
          </Box>

          {settings.doNotDisturb && (
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.doNotDisturbSchedule.enabled}
                    onChange={handleChange}
                    name="doNotDisturbSchedule.enabled"
                  />
                }
                label="Schedule Do Not Disturb"
              />
            </Box>
          )}

          {settings.doNotDisturb && settings.doNotDisturbSchedule.enabled && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Start Time"
                type="time"
                value={settings.doNotDisturbSchedule.startTime}
                onChange={handleChange}
                name="doNotDisturbSchedule.startTime"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="End Time"
                type="time"
                value={settings.doNotDisturbSchedule.endTime}
                onChange={handleChange}
                name="doNotDisturbSchedule.endTime"
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.doNotDisturbSchedule.timezone}
                  onChange={handleChange}
                  name="doNotDisturbSchedule.timezone"
                  label="Timezone"
                >
                  {Intl.supportedValuesOf('timeZone').map((zone) => (
                    <MenuItem key={zone} value={zone}>
                      {zone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Save Settings
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CallSettings; 