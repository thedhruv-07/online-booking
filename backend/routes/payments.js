const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { sendBookingEmail } = require('../utils/sendEmail');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

router.post('/', auth, async (req, res, next) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const payment = await Payment.create({
      userId: req.user._id,
      bookingId,
      method,
      amount: booking.totalAmount,
      status: 'pending',
    });

    const response = {
      paymentId: payment._id,
      clientSecret: payment._id.toString(),
    };

    if (method === 'bank_transfer') {
      response.bankDetails = {
        bankName: 'Example Bank',
        accountNumber: '1234567890',
        routingNumber: '0987654321',
        accountName: 'Booking App Inc',
        reference: `PAY-${payment._id}`,
      };
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('bookingId');

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.post('/verify/paypal', auth, async (req, res, next) => {
  try {
    const { paymentId, payerId } = req.body;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user._id,
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    payment.status = 'completed';
    payment.payerId = payerId;
    payment.transactionId = `PP-${paymentId}`;
    await payment.save();

    const updatedBooking = await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    }, { new: true });

    // Send notification email to admin and user
    try {
      await sendBookingEmail({ 
        user: req.user, 
        booking: updatedBooking, 
        payment 
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
      // We don't throw here to avoid breaking the response if email fails
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/bank-transfer', auth, upload.single('receipt'), handleMulterError, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (req.file) {
      payment.bankReceiptUrl = `/uploads/${req.file.filename}`;
    }

    payment.status = 'completed';
    payment.transactionId = `BT-${payment._id}`;
    await payment.save();

    const updatedBooking = await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    }, { new: true });

    // Send notification email to admin and user
    try {
      await sendBookingEmail({ 
        user: req.user, 
        booking: updatedBooking, 
        payment 
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * ✅ Demo Success Payment
 * POST /api/payments/demo-success
 */
router.post('/demo-success', auth, async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Create demo payment record
    const payment = await Payment.create({
      userId: req.user._id,
      bookingId,
      method: 'demo',
      amount: booking.totalAmount,
      status: 'completed',
      transactionId: `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    }, { new: true });

    // Trigger Email Notification
    try {
      await sendBookingEmail({ 
        user: req.user, 
        booking: updatedBooking, 
        payment 
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    res.json({
      success: true,
      message: 'Demo payment successful',
      payment
    });
  } catch (error) {
    next(error);
  }
});


router.get('/', auth, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({ payments, total, limit: Number(limit), offset: Number(offset) });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/refund', auth, async (req, res, next) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'completed') {
      throw new AppError('Can only refund completed payments', 400);
    }

    payment.status = 'refunded';
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'refunded',
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;