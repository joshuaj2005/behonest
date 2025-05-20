import React, { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import './DirectionsMap.css';

const libraries = ['places'];

const DirectionsMap = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const calculateRoute = useCallback(async () => {
    if (!origin || !destination) {
      setError('Please enter both pickup and drop locations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode],
        provideRouteAlternatives: true,
      });

      setDirections(result);
      const route = result.routes[0].legs[0];
      setRouteInfo({
        distance: route.distance.text,
        duration: route.duration.text,
        startAddress: route.start_address,
        endAddress: route.end_address,
      });

      if (map && result.routes[0].bounds) {
        map.fitBounds(result.routes[0].bounds);
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Could not calculate route. Please check your locations and try again.');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, travelMode, map]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  if (loadError) return <Alert severity="error">Error loading maps</Alert>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Box className="directions-container">
      <Paper elevation={3} className="directions-panel">
        <Typography variant="h5" gutterBottom>
          Calculate Route
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Pickup Location"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter pickup location"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Drop Location"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter drop location"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={travelMode}
              exclusive
              onChange={(e, newMode) => newMode && setTravelMode(newMode)}
              aria-label="travel mode"
              orientation="vertical"
              fullWidth
            >
              <ToggleButton value="DRIVING" aria-label="car">
                <DirectionsCarIcon /> Car
              </ToggleButton>
              <ToggleButton value="BICYCLING" aria-label="bike">
                <DirectionsBikeIcon /> Bike
              </ToggleButton>
              <ToggleButton value="WALKING" aria-label="walk">
                <DirectionsWalkIcon /> Walk
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={calculateRoute}
              disabled={loading || !origin || !destination}
              fullWidth
              sx={{ height: '100%' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Calculate'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" className="directions-alert">
          {error}
        </Alert>
      )}

      {routeInfo && (
        <Paper elevation={3} className="route-info">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Route Details
              </Typography>
              <Typography>
                <strong>Distance:</strong> {routeInfo.distance}
              </Typography>
              <Typography>
                <strong>Duration:</strong> {routeInfo.duration}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>From:</strong> {routeInfo.startAddress}
              </Typography>
              <Typography>
                <strong>To:</strong> {routeInfo.endAddress}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper elevation={3} className="map-container">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={12}
          center={{ lat: 13.0827, lng: 80.2707 }} // Default center (Chennai)
          onLoad={onMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#4285F4' }]
              }
            ]
          }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#4285F4',
                  strokeWeight: 5,
                }
              }}
            />
          )}
        </GoogleMap>
      </Paper>
    </Box>
  );
};

export default DirectionsMap; 