const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    selected: { type: [String], required: true },
    country: { type: String, required: true },
    region: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" }
  },
  location: mongoose.Schema.Types.Mixed,
  product: mongoose.Schema.Types.Mixed,
  bookingFiles: {
    type: Array,
    default: []
  },
  factory: mongoose.Schema.Types.Mixed,
  contact: mongoose.Schema.Types.Mixed,
  aql: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'draft',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  quoteBreakdown: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
  strict: false // Allow extra fields just in case
});

module.exports = mongoose.model('Booking', bookingSchema, 'bookingfinalv1');