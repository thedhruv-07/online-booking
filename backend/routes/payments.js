const express = require('express');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../utils/storage');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.post('/verify/paypal', paymentController.verifyPayPal);
router.post('/demo-success', paymentController.demoSuccess);
router.post('/:id/refund', paymentController.refundPayment);

// Bank transfer with receipt upload
router.post(
  '/:id/bank-transfer', 
  upload.single('receipt'), 
  handleMulterError, 
  paymentController.handleBankTransfer
);

module.exports = router;