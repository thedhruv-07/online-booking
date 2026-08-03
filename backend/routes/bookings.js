const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getQuote
} = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');
const { requireApiSecret } = require('../middleware/apiSecret');

const router = express.Router();

const REPORT_ELIGIBLE_STATUSES_SERVICE = ['confirmed', 'in_progress', 'completed'];

// Service-to-service route — MUST be registered before router.use(auth) below,
// since Express applies middleware in registration order and a route declared
// earlier in the same router never passes through a router.use() call declared later.
router.get('/:id/report-data/service', requireApiSecret, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.id).populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!REPORT_ELIGIBLE_STATUSES_SERVICE.includes(booking.status)) {
      return res.status(403).json({ success: false, message: 'Report data not available until booking is confirmed' });
    }

    res.json({
      bookingId:      booking._id,
      inspectionType: booking.service.selected,
      inspectionDate: booking.inspectionDate,
      client: {
        name:  booking.userId.name,
        email: booking.userId.email
      },
      product: {
        name:        booking.product.name,
        description: booking.product.description,
        quantity:    booking.product.quantity,
        unitType:    booking.product.unitType
      },
      factory: {
        name:    booking.factory.name,
        address: booking.factory.address,
        city:    booking.factory.city,
        country: booking.factory.country
      },
      contact: {
        name:  booking.contact.name,
        email: booking.contact.email,
        phone: booking.contact.phone
      },
      aql: {
        inspectionLevel:  booking.aql.inspectionLevel,
        majorDefectLimit: booking.aql.majorDefectLimit,
        minorDefectLimit: booking.aql.minorDefectLimit,
        sampleSize:       booking.aql.sampleSize,
        acceptPoint:      booking.aql.acceptPoint,
        rejectPoint:      booking.aql.rejectPoint
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.use(auth);

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.post('/quote', getQuote);

router.get('/upcoming', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookings = await Booking.find({
      userId: req.user._id,
      inspectionDate: { $gte: today },
      status: { $nin: ['cancelled', 'completed'] },
    }).sort({ inspectionDate: 1 }).limit(5);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(deleteBooking);

router.post('/:id/cancel', cancelBooking);

const REPORT_ELIGIBLE_STATUSES = ['confirmed', 'in_progress', 'completed'];

router.get('/:id/report-data', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.id).populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.userId && booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!REPORT_ELIGIBLE_STATUSES.includes(booking.status)) {
      return res.status(403).json({ success: false, message: 'Report data not available until booking is confirmed' });
    }

    res.json({
      bookingId:      booking._id,
      inspectionType: booking.service.selected,
      inspectionDate: booking.inspectionDate,
      client: {
        name:  booking.userId.name,
        email: booking.userId.email
      },
      product: {
        name:        booking.product.name,
        description: booking.product.description,
        quantity:    booking.product.quantity,
        unitType:    booking.product.unitType
      },
      factory: {
        name:    booking.factory.name,
        address: booking.factory.address,
        city:    booking.factory.city,
        country: booking.factory.country
      },
      contact: {
        name:  booking.contact.name,
        email: booking.contact.email,
        phone: booking.contact.phone
      },
      aql: {
        inspectionLevel:  booking.aql.inspectionLevel,
        majorDefectLimit: booking.aql.majorDefectLimit,
        minorDefectLimit: booking.aql.minorDefectLimit,
        sampleSize:       booking.aql.sampleSize,
        acceptPoint:      booking.aql.acceptPoint,
        rejectPoint:      booking.aql.rejectPoint
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;