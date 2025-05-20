import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,                                                                                                                            
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateBitmoji = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customization, setCustomization] = useState({
    skinTone: '#F5D0C5',
    hairColor: '#4A4A4A',
    hairStyle: 'default',
    eyeColor: '#634E34',
    outfit: 'casual'
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Convert avatar to blob
      const response = await fetch(avatar);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('bitmoji', blob);

      // Upload to server
      await api.post('/users/bitmoji', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/chat');
    } catch (error) {
      console.error('Error saving Bitmoji:', error);
      setError('Failed to save Bitmoji. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizationChange = (type, value) => {
    setCustomization(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const skinTones = ['#F5D0C5', '#EDB98A', '#D08B5B', '#AE5D29', '#694D3D'];
  const hairColors = ['#4A4A4A', '#A8553A', '#D4B98C', '#8C4922', '#231F20'];
  const eyeColors = ['#634E34', '#2C5697', '#8B8C8C', '#49B675', '#634E34'];
  const hairStyles = ['default', 'short', 'long', 'curly', 'wavy'];
  const outfits = ['casual', 'formal', 'sporty', 'professional', 'trendy'];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create Your Bitmoji
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Avatar Preview */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Bitmoji"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Button
                    component="label"
                    startIcon={<CameraIcon />}
                  >
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAvatar(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => setAvatar(null)} disabled={!avatar}>
                  <UndoIcon />
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!avatar || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Bitmoji'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Customization Options */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Customize
              </Typography>

              {/* Skin Tone */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Skin Tone</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {skinTones.map((color) => (
                    <IconButton
                      key={color}
                      onClick={() => handleCustomizationChange('skinTone', color)}
                      sx={{
                        bgcolor: color,
                        width: 40,
                        height: 40,
                        border: customization.skinTone === color ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Hair Color */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Hair Color</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {hairColors.map((color) => (
                    <IconButton
                      key={color}
                      onClick={() => handleCustomizationChange('hairColor', color)}
                      sx={{
                        bgcolor: color,
                        width: 40,
                        height: 40,
                        border: customization.hairColor === color ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Hair Style */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Hair Style</InputLabel>
                <Select
                  value={customization.hairStyle}
                  onChange={(e) => handleCustomizationChange('hairStyle', e.target.value)}
                  label="Hair Style"
                >
                  {hairStyles.map((style) => (
                    <MenuItem key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Eye Color */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Eye Color</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {eyeColors.map((color) => (
                    <IconButton
                      key={color}
                      onClick={() => handleCustomizationChange('eyeColor', color)}
                      sx={{
                        bgcolor: color,
                        width: 40,
                        height: 40,
                        border: customization.eyeColor === color ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Outfit */}
              <FormControl fullWidth>
                <InputLabel>Outfit</InputLabel>
                <Select
                  value={customization.outfit}
                  onChange={(e) => handleCustomizationChange('outfit', e.target.value)}
                  label="Outfit"
                >
                  {outfits.map((outfit) => (
                    <MenuItem key={outfit} value={outfit}>
                      {outfit.charAt(0).toUpperCase() + outfit.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CreateBitmoji; 