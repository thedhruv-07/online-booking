const express = require('express');
const { detectLocation } = require('../controllers/locationController');

const router = express.Router();

// Route does not necessarily need auth, but could add it if desired. 
// Open is fine for location detection.
router.get('/detect', detectLocation);

module.exports = router;
