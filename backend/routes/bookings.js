const express = require('express');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, paymentStatus, limit = 50, offset = 0 } = req.query;

    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ bookings, total, limit: Number(limit), offset: Number(offset) });
  } catch (error) {
    next(error);
  }
});

router.get('/quote', auth, async (req, res, next) => {
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
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'draft') {
      throw new AppError('Can only update draft bookings', 400);
    }

    Object.assign(booking, req.body);
    await booking.save();

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancel', auth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new AppError('Cannot cancel this booking', 400);
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/validate/:step', auth, async (req, res, next) => {
  try {
    const { step } = req.params;
    const stepData = req.body;

    const errors = {};

    switch (step) {
      case 'service':
        if (!stepData.service?.id) errors.service = 'Service is required';
        break;
      case 'location':
        if (!stepData.location?.country) errors.location = 'Country is required';
        break;
      case 'product':
        if (!stepData.product?.name) errors.product = 'Product name is required';
        break;
      case 'factory':
        if (!stepData.factory?.name) errors.factory = 'Factory is required';
        break;
      case 'contact':
        if (!stepData.contact?.email) errors.contact = 'Email is required';
        break;
      default:
        break;
    }

    res.json({ valid: Object.keys(errors).length === 0, errors: Object.keys(errors).length > 0 ? errors : undefined });
  } catch (error) {
    next(error);
  }
});

module.exports = router;