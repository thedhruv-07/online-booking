const mongoose = require('mongoose');

const bookingFileSchema = new mongoose.Schema({
  filename:   { type: String },
  url:        { type: String },
  mimetype:   { type: String },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    selected:    { type: [String] },
    name:        { type: String },
    country:     { type: String },
    region:      { type: String },
    basePrice:   { type: Number },
    discount:    { type: Number, default: 0 },
    totalAmount: { type: Number },
    currency:    { type: String, default: 'USD' },
  },
  inspectionDate: {
    type: Date,
    required: true,
  },
  product: {
    name:        { type: String },
    description: { type: String },
    unitType:    { type: String, enum: ['set', 'pieces'] },
    quantity:    { type: Number },
    piecesInSet: { type: Number },
    poNumber:    { type: String },
  },
  bookingFiles: {
    type:    [bookingFileSchema],
    default: [],
  },
  location: {
    country:    { type: String },
    city:       { type: String },
    address:    { type: String },
    postalCode: { type: String },
  },
  factory: {
    name:       { type: String },
    address:    { type: String },
    city:       { type: String },
    country:    { type: String },
    postalCode: { type: String },
  },
  contact: {
    name:        { type: String },
    email:       { type: String },
    phone:       { type: String },
    countryCode: { type: String },
    position:    { type: String },
  },
  aql: {
    inspectionType:   { type: String },
    inspectionLevel:  { type: String, enum: ['I', 'II', 'III', 'S-1', 'S-2', 'S-3', 'S-4'] },
    lotSize:          { type: Number },
    minorDefectLimit: { type: Number },
    majorDefectLimit: { type: Number },
    sampleSize:       { type: Number },
    acceptPoint:      { type: Number },
    rejectPoint:      { type: Number },
    codeLetter:       { type: String },
  },
  payment: {
    status:       { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    method:       { type: String, enum: ['razorpay', 'paypal', 'bank_transfer'], default: null },
    receiptFile:  { type: bookingFileSchema, default: null },
    paypalOrderId: { type: String },
    paidAt:       { type: Date },
  },
  status: {
    type:    String,
    enum:    ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'draft',
  },
  quoteBreakdown: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema, 'bookingfinalv1');
