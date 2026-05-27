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

const router = express.Router();

router.use(auth); // Protect all booking routes

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.post('/quote', getQuote);

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