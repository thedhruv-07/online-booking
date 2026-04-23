const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    console.log('--- CREATE BOOKING RAW BODY ---');
    console.log(JSON.stringify(req.body, null, 2));

    // Forcefully clean the files data
    let cleanFiles = [];
    if (req.body.files) {
      let rawFiles = req.body.files;
      
      // If it's a string, try to parse it
      if (typeof rawFiles === 'string') {
        try {
          rawFiles = JSON.parse(rawFiles);
        } catch (e) {
          // If JSON parse fails (e.g. single quotes), try to fix it or just wipe it
          rawFiles = [];
        }
      }

      // If it's an array, clean each element
      if (Array.isArray(rawFiles)) {
        cleanFiles = rawFiles.filter(f => f && typeof f === 'object').map(f => ({
          id: String(f.id || f._id || `file_${Date.now()}`),
          name: String(f.name || 'document'),
          url: String(f.url || ''),
          size: Number(f.size) || 0,
          type: String(f.type || 'application/octet-stream')
        }));
      }
    }

    // Build the booking object manually to avoid any hidden properties in req.body
    const bookingFields = {
      userId: req.user._id,
      service: req.body.service,
      location: req.body.location,
      product: req.body.product,
      bookingFiles: cleanFiles, // Use the new field name
      factory: req.body.factory,
      contact: req.body.contact,
      aql: req.body.aql,
      status: req.body.status || 'draft',
      paymentStatus: req.body.paymentStatus || 'pending',
      totalAmount: req.body.totalAmount || 0,
      quoteBreakdown: req.body.quoteBreakdown
    };

    const booking = await Booking.create(bookingFields);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('CREATE BOOKING ERROR:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error
    });
  }
};

// @desc    Get all bookings for user
// @route   GET /api/bookings
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking quote
// @route   POST /api/bookings/quote
exports.getQuote = async (req, res, next) => {
  try {
    // Simple mock quote logic
    const totalAmount = req.body.totalAmount || 249.00;
    res.status(200).json({
      success: true,
      data: {
        totalAmount,
        breakdown: req.body.quoteBreakdown || {
          baseService: 199.00,
          productCost: 50.00,
          total: totalAmount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
