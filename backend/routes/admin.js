const express = require('express');
const adminController = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth, admin);

router.get('/users', adminController.getAllUsers);
router.get('/bookings', adminController.getAllBookings);
router.get('/payments', adminController.getAllPayments);
router.get('/stats', adminController.getStats);

module.exports = router;