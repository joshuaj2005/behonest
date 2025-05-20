const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get active calls
router.get('/active', callController.getActiveCalls);

// Start a new call
router.post('/start', callController.startCall);

// Accept a call
router.post('/:callId/accept', callController.acceptCall);

// Reject a call
router.post('/:callId/reject', callController.rejectCall);

// End a call
router.post('/:callId/end', callController.endCall);

module.exports = router; 