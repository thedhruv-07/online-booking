const express = require('express');
const authRoutes = require('./auth');
const bookingRoutes = require('./bookings');
const paymentRoutes = require('./payments');
const uploadRoutes = require('./upload');
const adminRoutes = require('./admin');
const invoiceRoutes = require('./invoiceRoutes');
const locationRoutes = require('./location');

const router = express.Router();

/**
 * ✅ API Routes Registration
 */
router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/location', locationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;
