const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  method: {
    type: String,
    enum: ['paypal', 'bank_transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: String,
  payerId: String,
  paymentId: String,
  bankReceiptUrl: String,
  refundReason: String,
  refundedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);