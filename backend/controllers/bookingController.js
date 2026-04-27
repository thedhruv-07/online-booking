const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { calculateFinalPrice } = await import('../../shared/pricing.js');
    // 1. Backend IP Detection for Pricing Integrity
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ip === '::1' || ip === '127.0.0.1' || !ip) { ip = ''; } else { ip = ip.split(',')[0].trim(); }

    let detectedCountry = null;
    try {
      const ipResponse = await fetch(`http://ip-api.com/json/${ip}`);
      const ipData = await ipResponse.json();
      if (ipData && ipData.status === 'success') {
        detectedCountry = ipData.countryCode.toUpperCase();
      }
    } catch (e) {
      console.warn('IP detection failed during booking creation, using fallback.');
    }

    // Fallback Logic: Detect succeeds -> force it. Detect fails -> check req.body.service.country (ISO-2 only)
    let finalCountry = 'US';
    if (detectedCountry) {
      finalCountry = detectedCountry;
    } else {
      const bodyCountry = req.body.service?.country;
      if (typeof bodyCountry === 'string' && bodyCountry.length === 2) {
        finalCountry = bodyCountry.toUpperCase();
      }
    }

    // 2. Securely calculate price
    const selectedServices = req.body.service?.selected || [];
    const pricingResult = calculateFinalPrice(selectedServices, finalCountry);

    // 3. Add file processing fee if applicable
    let cleanFiles = [];
    if (req.body.files) {
      let rawFiles = req.body.files;
      if (typeof rawFiles === 'string') { try { rawFiles = JSON.parse(rawFiles); } catch (e) { rawFiles = []; } }
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

    if (cleanFiles.length > 0) {
      pricingResult.totalAmount += 50;
    }

    const bookingFields = {
      userId: req.user._id,
      service: {
        ...pricingResult,
        totalAmount: pricingResult.totalAmount // already updated with fee
      },
      location: req.body.location,
      product: req.body.product,
      bookingFiles: cleanFiles,
      factory: req.body.factory,
      contact: req.body.contact,
      aql: req.body.aql,
      status: req.body.status || 'draft',
      paymentStatus: req.body.paymentStatus || 'pending',
      totalAmount: pricingResult.totalAmount,
      quoteBreakdown: {
        basePrice: pricingResult.basePrice,
        discount: pricingResult.discount,
        fileFee: cleanFiles.length > 0 ? 50 : 0,
        finalTotal: pricingResult.totalAmount
      }
    };

    const booking = await Booking.create(bookingFields);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
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

    // Only recalculate if service or files are being updated
    if (req.body.service || req.body.bookingFiles) {
      const { calculateFinalPrice } = await import('../../shared/pricing.js');
      const selectedServices = req.body.service?.selected || booking.service.selected;
      const country = req.body.service?.country || booking.service.country;
      
      const pricingResult = calculateFinalPrice(selectedServices, country);
      
      // Check files for fee
      const hasFiles = (req.body.bookingFiles && req.body.bookingFiles.length > 0) || 
                       (booking.bookingFiles && booking.bookingFiles.length > 0);
      
      if (hasFiles) {
        pricingResult.totalAmount += 50;
      }

      req.body.service = {
        ...booking.service.toObject(),
        ...pricingResult
      };
      req.body.totalAmount = pricingResult.totalAmount;
      req.body.quoteBreakdown = {
        basePrice: pricingResult.basePrice,
        discount: pricingResult.discount,
        fileFee: hasFiles ? 50 : 0,
        finalTotal: pricingResult.totalAmount
      };
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

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await Booking.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
