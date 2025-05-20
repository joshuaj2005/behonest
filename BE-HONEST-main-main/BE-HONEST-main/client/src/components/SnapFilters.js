import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
  Button,
  Chip,
  Stack
} from '@mui/material';
import {
  LocalFireDepartment as FireIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import '../styles/SnapFilters.css';

const SnapFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    showStreaks: true,
    showOnline: true,
    showOffline: true,
    showLocation: true,
    minStreak: 0,
    maxDistance: 50, // in kilometers
    showTrophies: true
  });

  const handleFilterChange = (filter) => {
    const newFilters = {
      ...filters,
      [filter]: !filters[filter]
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSliderChange = (filter, value) => {
    const newFilters = {
      ...filters,
      [filter]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Paper className="filters-container">
      <Box className="filter-header">
        <Typography variant="h6">Filters</Typography>
      </Box>

      <FormGroup className="filter-group">
        <FormControlLabel
          control={
            <Switch
              checked={filters.showStreaks}
              onChange={() => handleFilterChange('showStreaks')}
              color="warning"
            />
          }
          label={
            <Box className="filter-item">
              <Box className="filter-icon warning">
                <FireIcon />
              </Box>
              <Box className="filter-label">
                <Typography>Show Streaks</Typography>
              </Box>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={filters.showOnline}
              onChange={() => handleFilterChange('showOnline')}
              color="success"
            />
          }
          label={
            <Box className="filter-item">
              <Box className="filter-icon success">
                <PersonIcon />
              </Box>
              <Box className="filter-label">
                <Typography>Show Online Friends</Typography>
              </Box>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={filters.showOffline}
              onChange={() => handleFilterChange('showOffline')}
              color="default"
            />
          }
          label={
            <Box className="filter-item">
              <Box className="filter-icon default">
                <PersonIcon />
              </Box>
              <Box className="filter-label">
                <Typography>Show Offline Friends</Typography>
              </Box>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={filters.showLocation}
              onChange={() => handleFilterChange('showLocation')}
              color="primary"
            />
          }
          label={
            <Box className="filter-item">
              <Box className="filter-icon primary">
                <LocationIcon />
              </Box>
              <Box className="filter-label">
                <Typography>Show Location</Typography>
              </Box>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={filters.showTrophies}
              onChange={() => handleFilterChange('showTrophies')}
              color="warning"
            />
          }
          label={
            <Box className="filter-item">
              <Box className="filter-icon warning">
                <TrophyIcon />
              </Box>
              <Box className="filter-label">
                <Typography>Show Trophies</Typography>
              </Box>
            </Box>
          }
        />
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      <Box className="slider-container">
        <Box className="slider-label">
          <Typography>Minimum Streak</Typography>
          <Typography className="slider-value">{filters.minStreak} days</Typography>
        </Box>
        <Slider
          value={filters.minStreak}
          onChange={(_, value) => handleSliderChange('minStreak', value)}
          min={0}
          max={100}
          marks
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value} days`}
        />
      </Box>

      <Box className="slider-container">
        <Box className="slider-label">
          <Typography>Maximum Distance</Typography>
          <Typography className="slider-value">{filters.maxDistance} km</Typography>
        </Box>
        <Slider
          value={filters.maxDistance}
          onChange={(_, value) => handleSliderChange('maxDistance', value)}
          min={0}
          max={100}
          marks
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value} km`}
        />
      </Box>

      <Box className="chip-container">
        <Chip
          className="filter-chip warning"
          icon={<FireIcon />}
          label={`Min Streak: ${filters.minStreak}`}
          variant="outlined"
        />
        <Chip
          className="filter-chip primary"
          icon={<LocationIcon />}
          label={`Max Distance: ${filters.maxDistance}km`}
          variant="outlined"
        />
      </Box>

      <Button
        className="reset-button"
        variant="outlined"
        color="secondary"
        onClick={() => {
          const defaultFilters = {
            showStreaks: true,
            showOnline: true,
            showOffline: true,
            showLocation: true,
            minStreak: 0,
            maxDistance: 50,
            showTrophies: true
          };
          setFilters(defaultFilters);
          onFilterChange(defaultFilters);
        }}
      >
        Reset Filters
      </Button>
    </Paper>
  );
};

export default SnapFilters; 