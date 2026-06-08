const express = require('express');
const { detectLocation } = require('../controllers/locationController');

const router = express.Router();

router.get('/detect', detectLocation);

module.exports = router;
