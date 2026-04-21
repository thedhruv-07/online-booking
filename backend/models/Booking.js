const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    id: String,
    name: String,
    description: String,
    basePrice: Number,
  },
  location: {
    id: String,
    country: String,
    city: String,
    address: String,
    postalCode: String,
  },
  product: {
    id: String,
    name: String,
    category: String,
    material: String,
    price: Number,
  },
  files: [{
    id: String,
    name: String,
    url: String,
    size: Number,
    type: String,
  }],
  factory: {
    id: String,
    name: String,
    location: String,
    capacity: String,
    certifications: [String],
  },
  contact: {
    name: String,
    email: String,
    phone: String,
    company: String,
    notes: String,
  },
  aql: {
    inspectionLevel: String,
    sampleSize: String,
    limits: {
      critical: { accept: Number, reject: Number },
      major: { accept: Number, reject: Number },
      minor: { accept: Number, reject: Number },
    },
  },
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
  quoteBreakdown: {
    baseService: Number,
    productCost: Number,
    aqlCost: Number,
    factoryFee: Number,
    total: Number,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);