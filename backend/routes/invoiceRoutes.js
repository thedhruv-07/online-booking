const express = require('express');
const router = express.Router();
const { downloadInvoice, directDownload } = require('../controllers/invoiceController');
const { auth } = require('../middleware/auth');

router.get('/:bookingId', auth, downloadInvoice);

router.get('/download/:bookingId', directDownload);

module.exports = router;
