const express = require('express');
const router = express.Router();
const { downloadInvoice, directDownload } = require('../controllers/invoiceController');
const { auth } = require('../middleware/auth');

// GET /api/invoice/:bookingId (Authenticated)
router.get('/:bookingId', auth, downloadInvoice);

// GET /api/invoice/download/:bookingId (Direct download for emails)
router.get('/download/:bookingId', directDownload);

module.exports = router;
