import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Alert,
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  LoadingButton
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Send as SendIcon,
  FilterList as FilterIcon,
  EmojiEvents as TrophyIcon,
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Place as PlaceIcon,
  Event as EventIcon,
  PhotoLibrary as PhotoLibraryIcon,
  LocalCafe as CafeIcon,
  LocalGasStation as GasStationIcon,
  Restaurant as RestaurantIcon,
  Hotel as HotelIcon,
  DirectionsCar as CarIcon,
  Directions as DirectionsIcon
} from '@mui/icons-material';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';

const libraries = ['places', 'directions'];

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const containerStyle = {
  width: '100%',
  height: '600px',
  position: 'relative'
};

const placeTypes = [
  { type: 'gas_station', icon: <GasStationIcon />, label: 'Petrol Bunks' },
  { type: 'cafe', icon: <CafeIcon />, label: 'Cafes' },
  { type: 'restaurant', icon: <RestaurantIcon />, label: 'Restaurants' },
  { type: 'lodging', icon: <HotelIcon />, label: 'Hotels' }
];

const SnapMap = () => {
  const [loading, setLoading] = useState(true);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
    version: "weekly",
    auth_referrer_policy: 'origin'
  });

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    showStreaks: true,
    showOnline: true,
    showOffline: true,
    showFilters: false
  });
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const [createMenuAnchorEl, setCreateMenuAnchorEl] = useState(null);
  const [showCreateSpot, setShowCreateSpot] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlaceType, setSelectedPlaceType] = useState('');
  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [newSpot, setNewSpot] = useState({
    name: '',
    description: '',
    type: 'spot',
    privacy: 'friends'
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    type: 'social',
    privacy: 'friends'
  });
  const [searchFriendQuery, setSearchFriendQuery] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showCreateMemory, setShowCreateMemory] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    images: [],
    privacy: 'friends',
    tags: []
  });
  const [showDirections, setShowDirections] = useState(false);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [geocoder, setGeocoder] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [directionsError, setDirectionsError] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  console.log('Google Maps API Key:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  const mapOptions = {
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    gestureHandling: 'cooperative',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        setError('Please log in to see friends on the map');
        setFriends([]);
        return;
      }

      const response = await axios.get('/api/friends/locations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setFriends(response.data);
      } else {
        setFriends([]);
      }
    } catch (err) {
      console.error('Friends fetch error:', err);
      setError('Failed to load friends: ' + (err.response?.data?.message || err.message));
      setFriends([]);
    }
  };

  const searchNearbyPlaces = useCallback((location, type) => {
    if (!map || !window.google) {
      setError('Maps not initialized. Please try again.');
      return;
    }

    try {
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        location: location,
        radius: 30000, // Increased to 30 KM
        type: type,
        rankBy: window.google.maps.places.RankBy.DISTANCE
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          console.log('Found nearby places:', results);
          setNearbyPlaces(results);
          
          // Create bounds to fit all places
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(location);
          results.forEach(place => {
            bounds.extend(place.geometry.location);
          });
          map.fitBounds(bounds);
        } else {
          console.error('Nearby search error:', status);
          setError(`Failed to find nearby places: ${status}. Please try again or adjust your search criteria.`);
          setNearbyPlaces([]);
        }
      });
    } catch (error) {
      console.error('Error in searchNearbyPlaces:', error);
      setError('Failed to search nearby places. Please try again.');
      setNearbyPlaces([]);
    }
  }, [map]);

  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser';
        console.error(error);
        setError(error);
        resolve(defaultCenter);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 60000, // Increased to 60 seconds
        maximumAge: 0
      };

      const successCallback = (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Got user location:', newCenter);
        setMapCenter(newCenter);
        if (map) {
          map.panTo(newCenter);
          map.setZoom(14);
        }
        resolve(newCenter);
      };

      const errorCallback = (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Location error: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += error.message;
        }
        setError(errorMessage);
        resolve(defaultCenter);
      };

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    });
  }, [map]);

  const calculateAndDisplayRoute = useCallback((origin, destination) => {
    if (!map || !window.google) {
      console.error('Map or Google Maps API not initialized');
      setError('Maps not initialized. Please try again.');
      return;
    }

    if (!origin || !destination) {
      console.error('Invalid origin or destination', { origin, destination });
      setError('Please select both origin and destination points.');
      return;
    }

    try {
      // Clear any existing error
      setError('');
      
      // Initialize DirectionsService and DirectionsRenderer
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5
        }
      });

      // Format the request parameters
      const request = {
        origin: typeof origin === 'string' ? origin : { lat: origin.lat(), lng: origin.lng() },
        destination: typeof destination === 'string' ? destination : { lat: destination.lat(), lng: destination.lng() },
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: true
      };

      console.log('Calculating route with params:', request);

      directionsService.route(request, (result, status) => {
        console.log('Directions API response:', { status, result });

        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          const route = result.routes[0].legs[0];
          setRouteInfo({
            distance: route.distance.text,
            duration: route.duration.text,
            start_address: route.start_address,
            end_address: route.end_address
          });

          // Fit the map to show the entire route
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].legs.forEach(leg => {
            leg.steps.forEach(step => {
              bounds.extend(step.start_location);
              bounds.extend(step.end_location);
            });
          });
          map.fitBounds(bounds);
        } else {
          console.error('Directions API error:', status);
          let errorMessage = 'Could not calculate directions. ';
          switch(status) {
            case 'ZERO_RESULTS':
              errorMessage += 'No route could be found between these locations.';
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage += 'You have exceeded your quota for Directions API requests.';
              break;
            case 'REQUEST_DENIED':
              errorMessage += 'Please ensure you have enabled the Directions API in your Google Cloud Console and that billing is set up.';
              break;
            case 'INVALID_REQUEST':
              errorMessage += 'The request was invalid. Please check your origin and destination points.';
              break;
            default:
              errorMessage += `Error: ${status}`;
          }
          setError(errorMessage);
          setRouteInfo(null);
        }
      });
    } catch (error) {
      console.error('Error in calculateAndDisplayRoute:', error);
      setError(`Failed to calculate route: ${error.message}`);
      setRouteInfo(null);
    }
  }, [map]);

  // Add a function to handle directions errors
  const handleDirectionsError = (status) => {
    switch (status) {
      case 'REQUEST_DENIED':
        setDirectionsError(
          'Request denied. Please make sure the Directions API is enabled in your Google Cloud Console and billing is set up.'
        );
        break;
      case 'ZERO_RESULTS':
        setDirectionsError('No route found between these points.');
        break;
      case 'MAX_WAYPOINTS_EXCEEDED':
        setDirectionsError('Too many waypoints provided.');
        break;
      case 'INVALID_REQUEST':
        setDirectionsError('Invalid request. Please check your origin and destination.');
        break;
      case 'OVER_QUERY_LIMIT':
        setDirectionsError('Over quota. Please try again later.');
        break;
      default:
        setDirectionsError(`Could not calculate directions: ${status}`);
    }
  };

  // Update calculateRoute function
  const calculateRoute = useCallback(async () => {
    console.log('Starting route calculation...');
    if (!directionsService || !directionsRenderer) {
      console.error('Services not initialized');
      setError("Directions service not initialized");
      return;
    }

    if (!originPlace || !destinationPlace) {
      setError("Please enter both origin and destination");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      console.log('Calculating route with:', {
        origin: originPlace,
        destination: destinationPlace,
        travelMode: 'DRIVING'
      });

      const request = {
        origin: originPlace,
        destination: destinationPlace,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: true
      };

      const result = await directionsService.route(request);
      console.log('Route result:', result);
      
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(result);
      setIsCalculating(false);
      setError(null);
    } catch (err) {
      console.error("Directions error:", err);
      setIsCalculating(false);
      
      if (err.code === "ZERO_RESULTS") {
        setError("No route could be found between these locations");
      } else if (err.code === "OVER_QUERY_LIMIT") {
        setError("You have exceeded your quota for Directions API requests");
      } else if (err.code === "REQUEST_DENIED") {
        setError("Request was denied. Please check if the Directions API is enabled and billing is set up");
      } else if (err.code === "INVALID_REQUEST") {
        setError("Invalid request. Please check the origin and destination addresses");
      } else {
        setError("An error occurred while calculating the route. Please try again.");
      }

      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    }
  }, [directionsService, directionsRenderer, originPlace, destinationPlace, map]);

  // Add a function to handle setting origin and destination
  const handleSetLocation = useCallback((place, type) => {
    if (!place || !place.geometry) {
      setError('Invalid location selected');
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    if (type === 'origin') {
      setOriginPlace(location);
      setError('');
    } else if (type === 'destination') {
      setDestinationPlace(location);
      setError('');
    }

    // If both origin and destination are set, calculate the route
    if (originPlace && type === 'destination') {
      calculateAndDisplayRoute(originPlace, location);
    } else if (destinationPlace && type === 'origin') {
      calculateAndDisplayRoute(location, destinationPlace);
    }
  }, [originPlace, destinationPlace, calculateAndDisplayRoute]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isLoaded || !window.google) {
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchQuery });
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        const newCenter = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        setMapCenter(newCenter);
        const place = result.results[0];
        setSelectedPlace(place);
        
        if (map) {
          map.panTo(newCenter);
          map.setZoom(15);

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0;">${place.formatted_address}</h3>
                <div style="margin-top: 8px;">
                  <button onclick="window.setAsOrigin()">Set as Start</button>
                  <button onclick="window.setAsDestination()">Set as Destination</button>
                </div>
              </div>
            `
          });

          const marker = new window.google.maps.Marker({
            position: newCenter,
            map: map,
            title: place.formatted_address
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          infoWindow.open(map, marker);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search location: ' + error.message);
    }
  };

  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(newLocation);
        },
        (error) => {
          console.error('Location watch error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    const initializeMap = async () => {
      console.log('Initializing map...');
      try {
        await fetchFriends();
        await getUserLocation();
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to initialize map: ' + err.message);
      } finally {
      setLoading(false);
    }
  };

    if (isLoaded) {
      console.log('Google Maps script loaded successfully');
      initializeMap();
    }
  }, [isLoaded, getUserLocation]);

  const onMapLoad = useCallback((map) => {
    console.log('Map component loaded successfully');
    mapRef.current = map;
    setMap(map);
    setLoading(false);
    const ds = new window.google.maps.DirectionsService();
    const dr = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      preserveViewport: false
    });
    setDirectionsService(ds);
    setDirectionsRenderer(dr);
  }, []);

  const onUnmount = useCallback(() => {
    console.log('Map component unmounted');
    mapRef.current = null;
    setMap(null);
  }, []);

  const handleSendSnap = async () => {
    if (!message.trim()) return;

    try {
      await axios.post('/api/snaps/send', {
        recipientId: selectedFriend._id,
        message,
        location: {
          lat: mapCenter.lat,
          lng: mapCenter.lng
        }
      });
      setMessage('');
      setSelectedFriend(null);
    } catch (error) {
      console.error('Error sending snap:', error);
      setError('Failed to send snap');
    }
  };

  const handleFilterChange = (filter) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleCreateClick = (event) => {
    setCreateMenuAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setCreateMenuAnchorEl(null);
  };

  const handleCreateSpot = async () => {
    try {
      if (!map || !window.google) return;

      const center = map.getCenter();
      const spotData = {
        ...newSpot,
        location: {
          lat: center.lat(),
          lng: center.lng()
        }
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/spots', spotData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        // Add the new spot to the map
        setShowCreateSpot(false);
        setNewSpot({
          name: '',
          description: '',
          type: 'spot',
          privacy: 'friends'
        });
        // You might want to refresh the spots on the map here
      }
    } catch (err) {
      console.error('Error creating spot:', err);
      setError('Failed to create spot: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateEvent = async () => {
    try {
      await axios.post('/api/events', {
        ...newEvent,
        location: {
          lat: mapCenter.lat,
          lng: mapCenter.lng
        }
      });
      setShowCreateEvent(false);
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        time: '',
        type: 'social',
        privacy: 'friends'
      });
      // Refresh events on map
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const fetchFriendsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/friends/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendsList(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to fetch friends list');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/friends/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setError('Failed to fetch friend requests');
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/friends/request', 
        { userId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setError('Friend request sent successfully!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/friends/accept', 
        { requestId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchFriendRequests();
      fetchFriendsList();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchFriendsList();
      fetchFriendRequests();
    }
  }, [isLoaded]);

  const handleCreateMemory = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newMemory.title);
      formData.append('description', newMemory.description);
      formData.append('location', JSON.stringify({
        lat: mapCenter.lat,
        lng: mapCenter.lng
      }));
      formData.append('privacy', newMemory.privacy);
      formData.append('tags', JSON.stringify(newMemory.tags));

      // Append each image file
      newMemory.images.forEach(image => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/memories', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setShowCreateMemory(false);
        setNewMemory({
          title: '',
          description: '',
          images: [],
          privacy: 'friends',
          tags: []
        });
        // You might want to refresh the memories on the map here
      }
    } catch (err) {
      console.error('Error creating memory:', err);
      setError('Failed to create memory: ' + (err.response?.data?.message || err.message));
    }
  };

  // Initialize geocoder when map is loaded
  useEffect(() => {
    if (window.google && !geocoder) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [window.google, geocoder]);

  // Update setAsOrigin function
  const setAsOrigin = useCallback((location) => {
    if (!location) return;
    setOriginPlace(location);
    setOriginInput(location.formatted_address || `${location.lat}, ${location.lng}`);
  }, []);

  // Add geocodeAddress function
  const geocodeAddress = useCallback((address, isOrigin = true) => {
    if (!geocoder) return;

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          formatted_address: results[0].formatted_address
        };
        
        if (isOrigin) {
          setOriginPlace(location);
          setOriginInput(location.formatted_address);
        } else {
          setDestinationPlace(location);
          setDestinationInput(location.formatted_address);
        }
      } else {
        setError(`Could not find location: ${status}`);
      }
    });
  }, [geocoder]);

  const DirectionsDialog = ({ open, handleClose }) => {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Get Directions</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="Enter starting location"
            />
            <TextField
              fullWidth
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              variant="outlined"
              placeholder="Enter destination"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            onClick={calculateRoute}
            variant="contained"
            color="primary"
            disabled={!origin || !destination || isCalculating}
            startIcon={isCalculating ? <CircularProgress size={20} /> : null}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Route'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  useEffect(() => {
    // Add setAsDestination to window object
    window.setAsDestination = (place) => {
      if (!place || !place.geometry || !place.geometry.location) {
        setError('Invalid place selected for destination');
        return;
      }
      
      setDestination(place.formatted_address || `${place.geometry.location.lat()},${place.geometry.location.lng()}`);
      setDestinationPlace(place);
      
      if (origin) {
        calculateAndDisplayRoute(origin, place.formatted_address);
      }
      
      // Pan to the selected place
      if (map) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
      }
    };

    return () => {
      // Cleanup
      delete window.setAsDestination;
    };
  }, [map, origin, calculateAndDisplayRoute]);

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load Google Maps: {loadError.message}
          <br />
          Please check your API key and make sure billing is enabled.
        </Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Snap Map</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={getUserLocation} title="My Location">
                  <MyLocationIcon />
                </IconButton>
                <IconButton onClick={(e) => setCreateMenuAnchorEl(e.currentTarget)}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                  <TextField
                sx={{ flex: 1 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Find Nearby</InputLabel>
                <Select
                  value={selectedPlaceType}
                  label="Find Nearby"
                  onChange={(e) => {
                    setSelectedPlaceType(e.target.value);
                    if (e.target.value) {
                      searchNearbyPlaces(mapCenter, e.target.value);
                    } else {
                      setNearbyPlaces([]);
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Select type</em>
                  </MenuItem>
                  {placeTypes.map(({ type, icon, label }) => (
                    <MenuItem key={type} value={type}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icon}
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton 
                onClick={getUserLocation} 
                title="My Location"
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <MyLocationIcon />
              </IconButton>
            </Box>

            {routeInfo && (
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Route Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>From:</strong> {routeInfo.start_address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>To:</strong> {routeInfo.end_address}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Distance:</strong> {routeInfo.distance}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {routeInfo.duration}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={14}
                options={{
                  zoomControl: true,
                  streetViewControl: true,
                  mapTypeControl: true,
                  fullscreenControl: true
                }}
                onLoad={onMapLoad}
                onUnmount={onUnmount}
              >
                {/* Current location marker with avatar */}
                <Marker
                    position={mapCenter}
                  icon={{
                    url: '/avatar-marker.svg',
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 20)
                  }}
                />

                {/* Friends markers */}
                {friends.map((friend) => (
                  <Marker
                    key={friend._id}
                    position={{ lat: friend.location.lat, lng: friend.location.lng }}
                    onClick={() => setSelectedFriend(friend)}
                  />
                ))}

                {/* Nearby places markers */}
                {nearbyPlaces.map((place) => (
                  <Marker
                    key={place.place_id}
                    position={place.geometry.location}
                    icon={{
                      url: place.icon,
                      scaledSize: new window.google.maps.Size(32, 32),
                      anchor: new window.google.maps.Point(16, 16)
                    }}
                    onClick={() => {
                      const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                          <div style="padding: 8px;">
                            <h3 style="margin: 0 0 8px 0;">${place.name}</h3>
                            <p style="margin: 4px 0;">${place.vicinity}</p>
                            ${place.rating ? `
                              <p style="margin: 4px 0;">
                                Rating: ${place.rating} ⭐ (${place.user_ratings_total} reviews)
                              </p>
                            ` : ''}
                            ${place.opening_hours?.open_now !== undefined ? `
                              <p style="margin: 4px 0; color: ${place.opening_hours.open_now ? 'green' : 'red'}">
                                ${place.opening_hours.open_now ? 'Open Now' : 'Closed'}
                              </p>
                            ` : ''}
                          </div>
                        `
                      });
                      infoWindow.open(map, place);
                    }}
                  />
                ))}

                {selectedFriend && (
                  <InfoWindow
                    position={{ lat: selectedFriend.location.lat, lng: selectedFriend.location.lng }}
                    onCloseClick={() => setSelectedFriend(null)}
                  >
                    <div>
                      <Typography variant="subtitle1">{selectedFriend.username}</Typography>
                          <Typography variant="body2">
                        {selectedFriend.online ? 'Online' : 'Offline'}
                          </Typography>
                    </div>
                      </InfoWindow>
                    )}

                {selectedPlace && (
                  <InfoWindow
                    position={selectedPlace.geometry.location}
                    onCloseClick={() => setSelectedPlace(null)}
                  >
                    <div>
                      <Typography variant="subtitle1">{selectedPlace.formatted_address}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleCreateSpot(selectedPlace)}
                        >
                          Create Spot
                        </Button>
                      </Box>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Friends</Typography>
            
            <TextField
              fullWidth
              size="small"
              placeholder="Search friends..."
              value={searchFriendQuery}
              onChange={(e) => setSearchFriendQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            {friendRequests.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Friend Requests</Typography>
                <List>
                  {friendRequests.map((request) => (
                    <ListItem
                      key={request._id}
                      secondaryAction={
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => acceptFriendRequest(request._id)}
                        >
                          Accept
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>{request.from.username[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={request.from.username} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <List>
              {friendsList
                .filter(friend => 
                  friend.username.toLowerCase().includes(searchFriendQuery.toLowerCase())
                )
                .map((friend) => (
                <ListItem
                  key={friend._id}
                  button
                    onClick={() => {
                      setSelectedFriend(friend);
                      if (friend.location) {
                        setMapCenter({
                          lat: friend.location.lat,
                          lng: friend.location.lng
                        });
                        map?.panTo({
                          lat: friend.location.lat,
                          lng: friend.location.lng
                        });
                      }
                    }}
                >
                  <ListItemAvatar>
                      <Avatar>{friend.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.username}
                      secondary={friend.online ? 'Online' : 'Offline'}
                    />
                    {friend.location && (
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        setMapCenter({
                          lat: friend.location.lat,
                          lng: friend.location.lng
                        });
                        map?.panTo({
                          lat: friend.location.lat,
                          lng: friend.location.lng
                        });
                      }}>
                        <LocationIcon color="primary" />
                      </IconButton>
                    )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!selectedFriend} onClose={() => setSelectedFriend(null)}>
        <DialogTitle>Send Snap to {selectedFriend?.username}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFriend(null)}>Cancel</Button>
          <Button onClick={handleSendSnap} variant="contained" startIcon={<SendIcon />}>
            Send Snap
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1 }}>
        <Button
          variant="contained"
          onClick={handleCreateClick}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 20,
            px: 3,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Create
        </Button>
        <Menu
          anchorEl={createMenuAnchorEl}
          open={Boolean(createMenuAnchorEl)}
          onClose={handleCreateClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => {
            handleCreateClose();
            setShowCreateSpot(true);
          }}>
            <ListItemIcon>
              <PlaceIcon />
            </ListItemIcon>
            <ListItemText primary="Create Spot" />
          </MenuItem>
          <MenuItem onClick={() => {
            handleCreateClose();
            setShowCreateEvent(true);
          }}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Create Event" />
          </MenuItem>
          <MenuItem onClick={() => {
            handleCreateClose();
            setShowCreateMemory(true);
          }}>
            <ListItemIcon>
              <PhotoLibraryIcon />
            </ListItemIcon>
            <ListItemText primary="Create Memory" />
          </MenuItem>
        </Menu>
      </Box>

      <Dialog
        open={showCreateSpot}
        onClose={() => setShowCreateSpot(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Spot</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Spot Name"
              fullWidth
              value={newSpot.name}
              onChange={(e) => setNewSpot(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newSpot.description}
              onChange={(e) => setNewSpot(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newSpot.type}
                label="Type"
                onChange={(e) => setNewSpot(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="hangout">Hangout Spot</MenuItem>
                <MenuItem value="food">Food & Drinks</MenuItem>
                <MenuItem value="activity">Activity Spot</MenuItem>
                <MenuItem value="study">Study Spot</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Privacy</InputLabel>
              <Select
                value={newSpot.privacy}
                label="Privacy"
                onChange={(e) => setNewSpot(prev => ({ ...prev, privacy: e.target.value }))}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="friends">Friends Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateSpot(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSpot}
            variant="contained"
            disabled={!newSpot.name || !newSpot.description}
          >
            Create Spot
              </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            />
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.date.toISOString().split('T')[0]}
              onChange={(e) => setNewEvent(prev => ({ ...prev, date: new Date(e.target.value) }))}
            />
            <TextField
              label="Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.time}
              onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newEvent.type}
                label="Type"
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="social">Social Gathering</MenuItem>
                <MenuItem value="sports">Sports & Activities</MenuItem>
                <MenuItem value="study">Study Group</MenuItem>
                <MenuItem value="entertainment">Entertainment</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Privacy</InputLabel>
              <Select
                value={newEvent.privacy}
                label="Privacy"
                onChange={(e) => setNewEvent(prev => ({ ...prev, privacy: e.target.value }))}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="friends">Friends Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateEvent(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateEvent}
            variant="contained"
            disabled={!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showCreateMemory}
        onClose={() => setShowCreateMemory(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Memory</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={newMemory.title}
              onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newMemory.description}
              onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
            />
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setNewMemory(prev => ({ ...prev, images: files }));
              }}
              style={{ display: 'none' }}
              id="memory-image-upload"
            />
            <label htmlFor="memory-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoLibraryIcon />}
                fullWidth
              >
                Upload Images (Max 5)
              </Button>
            </label>
            {newMemory.images.length > 0 && (
              <Typography variant="body2">
                {newMemory.images.length} image(s) selected
              </Typography>
            )}
            <TextField
              label="Tags (comma separated)"
              fullWidth
              value={newMemory.tags.join(', ')}
              onChange={(e) => setNewMemory(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
            />
            <FormControl fullWidth>
              <InputLabel>Privacy</InputLabel>
              <Select
                value={newMemory.privacy}
                label="Privacy"
                onChange={(e) => setNewMemory(prev => ({ ...prev, privacy: e.target.value }))}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="friends">Friends Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateMemory(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateMemory}
            variant="contained"
            disabled={!newMemory.title || !newMemory.description}
          >
            Create Memory
          </Button>
        </DialogActions>
      </Dialog>

      {/* Directions Dialog */}
      <DirectionsDialog
        open={showDirections}
        handleClose={() => setShowDirections(false)}
      />

      {/* Add Directions Button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowDirections(true)}
          startIcon={<DirectionsIcon />}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            },
            boxShadow: 3
          }}
        >
          Get Directions
        </Button>
      </Box>
    </Box>
  );
};

export default SnapMap; 