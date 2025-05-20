const express = require('express');
const router = express.Router();
const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

// Get route between two points
router.post('/route', async (req, res) => {
  try {
    const { origin, destination, travelMode } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const response = await client.directions({
      params: {
        origin,
        destination,
        mode: travelMode || 'driving',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.routes.length === 0) {
      return res.status(404).json({ error: 'No route found between the specified locations' });
    }

    const route = response.data.routes[0].legs[0];
    res.json({
      distance: route.distance,
      duration: route.duration,
      startAddress: route.start_address,
      endAddress: route.end_address,
      steps: route.steps.map(step => ({
        distance: step.distance,
        duration: step.duration,
        instructions: step.html_instructions,
        maneuver: step.maneuver,
        polyline: step.polyline
      }))
    });
  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
});

// Get place suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { input } = req.query;

    if (!input) {
      return res.status(400).json({ error: 'Input query is required' });
    }

    const response = await client.findPlaceFromText({
      params: {
        input,
        inputtype: 'textquery',
        fields: ['formatted_address', 'geometry', 'name'],
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data.candidates);
  } catch (error) {
    console.error('Error getting place suggestions:', error);
    res.status(500).json({ error: 'Failed to get place suggestions' });
  }
});

module.exports = router; 