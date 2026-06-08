const path = require('path');
let Queue;
try {
  Queue = require('bull');
} catch (e) {

  Queue = require(path.join(__dirname, '..', 'backend', 'node_modules', 'bull'));
}
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379';

const queue = new Queue('webhook-deliveries', REDIS_URL);

const addDeliveryJob = async (deliveryId, opts = {}) => {

  return queue.add('deliver', { deliveryId }, {
    attempts: opts.attempts || 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
    jobId: `webhook:${deliveryId}` 
  });
};

module.exports = { queue, addDeliveryJob };
