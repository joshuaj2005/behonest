const express = require('express');
const router = express.Router();

// GET /api/parties
router.get('/', (req, res) => {
  res.json({ message: 'Parties endpoint' });
});

module.exports = router; 