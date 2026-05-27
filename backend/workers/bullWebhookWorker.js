const fetch = global.fetch || require('node-fetch');
const crypto = require('crypto');
const { queue } = require('../queues/webhookQueue');
const WebhookDelivery = require('../models/WebhookDelivery');

const SECRET = process.env.REPORT_APP_WEBHOOK_SECRET || '';

queue.process('deliver', async (job, done) => {
  const { deliveryId } = job.data;
  try {
    const delivery = await WebhookDelivery.findById(deliveryId);
    if (!delivery) return done(new Error('Delivery not found'));
    if (delivery.status === 'sent') return done();

    const body = JSON.stringify(delivery.payload);
    const signature = SECRET ? `sha256=${crypto.createHmac('sha256', SECRET).update(body).digest('hex')}` : null;

    const res = await fetch(delivery.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(signature ? { 'x-webhook-signature': signature } : {}),
        ...(SECRET ? { 'x-webhook-secret': SECRET } : {}),
      },
      body,
      timeout: 5000,
    });

    if (res.ok) {
      delivery.status = 'sent';
      delivery.attempts = (delivery.attempts || 0) + 1;
      delivery.lastError = null;
      await delivery.save();
      return done();
    }

    const text = await res.text().catch(() => `${res.status}`);
    delivery.attempts = (delivery.attempts || 0) + 1;
    delivery.lastError = `HTTP ${res.status}: ${text}`;
    if (delivery.attempts >= delivery.maxAttempts) delivery.status = 'failed';
    await delivery.save();
    return done(new Error(delivery.lastError));
  } catch (err) {
    const delivery = await WebhookDelivery.findById(deliveryId).catch(() => null);
    if (delivery) {
      delivery.attempts = (delivery.attempts || 0) + 1;
      delivery.lastError = err.message;
      if (delivery.attempts >= delivery.maxAttempts) delivery.status = 'failed';
      await delivery.save().catch(() => {});
    }
    return done(err);
  }
});

queue.on('completed', (job, result) => {
  console.log('Webhook job completed', job.id);
});

queue.on('failed', (job, err) => {
  console.warn('Webhook job failed', job.id, err.message);
});

console.log('Bull webhook worker initialized');
