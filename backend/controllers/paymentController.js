const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');
const { sendBookingEmail, sendBookingReceiptEmail } = require('../utils/sendEmail');

const REPORT_APP_WEBHOOK_URL = process.env.REPORT_APP_WEBHOOK_URL;
const REPORT_APP_WEBHOOK_SECRET = process.env.REPORT_APP_WEBHOOK_SECRET;
const WebhookDelivery = require('../models/WebhookDelivery');
const crypto = require('crypto');
const BACKEND_PUBLIC_URL = (process.env.BACKEND_URL || process.env.API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

const toAbsoluteUrl = (maybeRelativeUrl) => {
  if (!maybeRelativeUrl) return null;
  if (/^https?:\/\//i.test(maybeRelativeUrl)) return maybeRelativeUrl;
  return `${BACKEND_PUBLIC_URL}${maybeRelativeUrl.startsWith('/') ? '' : '/'}${maybeRelativeUrl}`;
};

/**
 * Enqueue webhook delivery to Report App. This creates a persistent delivery
 * record which a background worker will process with retries and HMAC signature.
 */
const notifyReportApp = async ({ eventType, booking, payment, user, receiptUrl = null }) => {
  if (!REPORT_APP_WEBHOOK_URL) return;

  const payload = {
    eventType,
    source: 'booking-app',
    createdAt: new Date().toISOString(),
    booking: {
      id: booking._id.toString(),
      status: booking.status,
      inspectionDate: booking.inspectionDate,
      service: booking.service,
      product: booking.product,
      factory: booking.factory,
      contact: booking.contact,
      aql: booking.aql,
    },
    payment: payment ? {
      id: payment._id?.toString?.() || payment.id || null,
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      transactionId: payment.transactionId || null,
      payerId: payment.payerId || null,
      receiptUrl: toAbsoluteUrl(receiptUrl),
    } : null,
    user: user ? {
      id: user._id?.toString?.() || user.id || null,
      name: user.name,
      email: user.email,
    } : null,
  };

  // Idempotency: prefer payment id, fallback to booking id+eventType
  const idempotencyKey = (payload.payment && payload.payment.id) ? `payment:${payload.payment.id}` : `booking:${payload.booking.id}:${eventType}`;

  try {
    const existing = await WebhookDelivery.findOne({ idempotencyKey, status: 'sent' });
    if (existing) return; // already sent

    const delivery = await WebhookDelivery.create({
      url: REPORT_APP_WEBHOOK_URL,
      eventType,
      payload,
      idempotencyKey,
      nextAttemptAt: Date.now(),
    });

    // enqueue Bull job for processing
    try {
      const { addDeliveryJob } = require('../queues/webhookQueue');
      await addDeliveryJob(delivery._id.toString(), { attempts: delivery.maxAttempts });
    } catch (qErr) {
      console.error('Failed to enqueue Bull job:', qErr.message);
    }
  } catch (err) {
    console.error('Failed to enqueue webhook delivery:', err.message);
  }
};

/**
 * ✅ Create new payment session
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // 🛡️ RE-CALCULATE PRICE FOR INTEGRITY
    const { calculateFinalPrice } = await import('../../shared/pricing.js');
    const pricingResult = calculateFinalPrice(booking.service.selected, booking.service.country);
    
    // Add file fee if applicable
    if (booking.bookingFiles && booking.bookingFiles.length > 0) {
      pricingResult.totalAmount += 50;
    }

    // STRICT COMPARISON
    if (Math.abs(pricingResult.totalAmount - booking.service.totalAmount) > 0.01) {
      console.error(`PAYMENT TAMPERING DETECTED: DB=${booking.service.totalAmount}, Calc=${pricingResult.totalAmount}`);
      throw new AppError('Price mismatch detected. Please contact support or restart booking.', 400);
    }

    const payment = await Payment.create({
      userId: req.user._id,
      bookingId,
      method,
      amount: pricingResult.totalAmount,
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
};

/**
 * ✅ Get payment details
 */
exports.getPaymentById = async (req, res, next) => {
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
};

/**
 * ✅ Verify PayPal payment
 */
exports.verifyPayPal = async (req, res, next) => {
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
      'payment.status': 'paid',
      'payment.method': 'paypal',
      'payment.paypalOrderId': paymentId,
      'payment.paidAt': new Date(),
      status: 'confirmed',
    }, { new: true });

    try {
      await sendBookingEmail({
        user: req.user,
        booking: updatedBooking,
        payment
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    try {
      await notifyReportApp({
        eventType: 'booking.confirmed',
        booking: updatedBooking,
        payment,
        user: req.user,
      });
    } catch (webhookError) {
      console.error('Failed to notify report app:', webhookError.message);
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Handle Bank Transfer Receipt
 */
exports.handleBankTransfer = async (req, res, next) => {
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

    const receiptUpdate = req.file ? {
      'payment.receiptFile': {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
      }
    } : {};

    const updatedBooking = await Booking.findByIdAndUpdate(payment.bookingId, {
      'payment.status': 'paid',
      'payment.method': 'bank_transfer',
      'payment.paidAt': new Date(),
      ...receiptUpdate,
      status: 'confirmed',
    }, { new: true });

    try {
      await sendBookingEmail({
        user: req.user,
        booking: updatedBooking,
        payment
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    try {
      await notifyReportApp({
        eventType: 'booking.confirmed',
        booking: updatedBooking,
        payment,
        user: req.user,
      });
    } catch (webhookError) {
      console.error('Failed to notify report app:', webhookError.message);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Demo Success Payment
 */
exports.demoSuccess = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

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
      method: 'demo',
      amount: booking.service.totalAmount,
      status: 'completed',
      transactionId: `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
      'payment.status': 'paid',
      'payment.paidAt': new Date(),
      status: 'confirmed',
    }, { new: true });

    try {
      await sendBookingEmail({ 
        user: req.user, 
        booking: updatedBooking, 
        payment 
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    try {
      await notifyReportApp({
        eventType: 'booking.confirmed',
        booking: updatedBooking,
        payment,
        user: req.user,
      });
    } catch (webhookError) {
      console.error('Failed to notify report app:', webhookError.message);
    }

    res.json({
      success: true,
      message: 'Demo payment successful',
      payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get all user payments
 */
exports.getAllPayments = async (req, res, next) => {
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
};

/**
 * ✅ Refund payment
 */
exports.refundPayment = async (req, res, next) => {
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
      'payment.status': 'refunded',
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Upload bank/payment receipt by booking ID
 * POST /payments/bank-receipt
 * Body: bookingId (string), method (string, optional, default: 'bank_transfer')
 * File: receipt (via multer)
 */
exports.uploadBankReceipt = async (req, res, next) => {
  try {
    const { bookingId, method = 'bank_transfer' } = req.body;

    const VALID_METHODS = ['razorpay', 'bank_transfer'];
    const safeMethod = VALID_METHODS.includes(method) ? method : 'bank_transfer';

    if (!bookingId) {
      throw new AppError('bookingId is required', 400);
    }

    if (!req.file) {
      throw new AppError('Receipt file is required', 400);
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id })
      .populate('userId', 'name email');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    booking.payment.receiptFile = {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
    };
    booking.payment.method = safeMethod;
    // payment.status intentionally stays 'pending' — admin confirms manually
    await booking.save();

    try {
      await sendBookingReceiptEmail({
        user: req.user,
        booking,
        receiptPath: req.file.path,
      });
    } catch (emailErr) {
      console.error('Failed to send receipt emails:', emailErr.message);
    }

    try {
      await notifyReportApp({
        eventType: 'booking.payment.received',
        booking,
        payment: booking.payment,
        user: req.user,
        receiptUrl: booking.payment.receiptFile?.url || null,
      });
    } catch (webhookError) {
      console.error('Failed to notify report app:', webhookError.message);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
