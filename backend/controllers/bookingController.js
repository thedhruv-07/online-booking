const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (with pagination, filters, and search)
// @route   GET /api/bookings
exports.getBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { 'product.name': { $regex: search, $options: 'i' } },
        { 'factory.name': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Can only update draft bookings' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate quote
// @route   POST /api/bookings/quote
exports.getQuote = async (req, res, next) => {
  try {
    const { service, product, aql, factory } = req.body;

    const baseService = service?.basePrice || 0;
    const productCost = product?.price || 0;
    
    let aqlCost = 0;
    if (aql?.inspectionLevel) {
      aqlCost = aql.inspectionLevel === 'general' ? 150 : 250;
    }

    let factoryFee = 0;
    if (factory?.capacity) {
      const capacity = parseInt(factory.capacity);
      if (capacity < 1000) factoryFee = 100;
      else if (capacity < 5000) factoryFee = 200;
      else factoryFee = 300;
    }

    const total = baseService + productCost + aqlCost + factoryFee;

    res.json({
      success: true,
      totalAmount: total,
      breakdown: {
        baseService,
        productCost,
        aqlCost,
        factoryFee,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};
