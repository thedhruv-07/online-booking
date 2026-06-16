const Booking = require('../models/Booking');
const { sendRazorpayNotificationEmail } = require('../utils/sendEmail');
const { notifyReportApp } = require('./paymentController');

exports.createBooking = async (req, res, next) => {
  try {
    const { calculateFinalPrice } = await import('../../shared/pricing.js');

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

    let finalCountry = 'US';
    if (detectedCountry) {
      finalCountry = detectedCountry;
    } else {
      const bodyCountry = req.body.service?.country;
      if (typeof bodyCountry === 'string' && bodyCountry.length === 2) {
        finalCountry = bodyCountry.toUpperCase();
      }
    }

    const selectedServices = req.body.service?.selected || [];
    const pricingResult = calculateFinalPrice(selectedServices, finalCountry);

    let cleanFiles = [];
    if (req.body.files) {
      let rawFiles = req.body.files;
      if (typeof rawFiles === 'string') { try { rawFiles = JSON.parse(rawFiles); } catch (e) { rawFiles = []; } }
      if (Array.isArray(rawFiles)) {
        cleanFiles = rawFiles.filter(f => f && typeof f === 'object').map(f => ({
          filename: String(f.name || f.filename || 'document'),
          url: String(f.url || ''),
          mimetype: String(f.type || f.mimetype || 'application/octet-stream'),
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
        name: req.body.service?.name,
        totalAmount: pricingResult.totalAmount 
      },
      inspectionDate: req.body.product?.inspectionDate || req.body.inspectionDate,
      product: req.body.product,
      bookingFiles: cleanFiles,
      location: req.body.location,
      factory: req.body.factory,
      contact: req.body.contact,
      aql: req.body.aql,
      status: req.body.status || 'draft',
      payment: {
        status: 'pending',
        method: req.body.payment?.method || null,
      },
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

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.body.service || req.body.bookingFiles) {
      const { calculateFinalPrice } = await import('../../shared/pricing.js');
      const selectedServices = req.body.service?.selected || booking.service.selected;
      const country = req.body.service?.country || booking.service.country;

      const pricingResult = calculateFinalPrice(selectedServices, country);

      const hasFiles = (req.body.bookingFiles && req.body.bookingFiles.length > 0) || 
                       (booking.bookingFiles && booking.bookingFiles.length > 0);

      if (hasFiles) {
        pricingResult.totalAmount += 50;
      }

      req.body.service = {
        ...booking.service.toObject(),
        ...pricingResult
      };
      req.body.quoteBreakdown = {
        basePrice: pricingResult.basePrice,
        discount: pricingResult.discount,
        fileFee: hasFiles ? 50 : 0,
        finalTotal: pricingResult.totalAmount
      };
    }

    const ALLOWED_FIELDS = ['status', 'payment', 'inspectionDate', 'product', 'factory', 'contact', 'aql', 'bookingFiles'];
    const updateData = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (req.body.service)        updateData.service        = req.body.service;
    if (req.body.quoteBreakdown) updateData.quoteBreakdown = req.body.quoteBreakdown;

    booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (updateData.payment?.method === 'razorpay') {
      sendRazorpayNotificationEmail({ user: req.user, booking }).catch(err => {
        console.error('Razorpay notification email failed:', err.message);
      });
      notifyReportApp({
        eventType: 'booking.payment.received',
        booking,
        payment: booking.payment,
        user: req.user,
      }).catch(err => {
        console.error('Webhook notify failed (razorpay):', err.message);
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

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

exports.getQuote = async (req, res, next) => {
  try {

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
