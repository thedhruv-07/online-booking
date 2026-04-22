const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
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
  .put(updateBooking);

router.post('/:id/cancel', cancelBooking);

module.exports = router;