const mongoose = require('mongoose');

const WebhookDeliverySchema = new mongoose.Schema({
  url: { type: String, required: true },
  eventType: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed },
  idempotencyKey: { type: String, index: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  status: { type: String, enum: ['pending','sent','failed'], default: 'pending' },
  lastError: { type: String, default: null },
  nextAttemptAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('WebhookDelivery', WebhookDeliverySchema);
