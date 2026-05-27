const express = require('express');
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../utils/storage');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Single file upload
router.post('/file', upload.single('file'), handleMulterError, uploadController.uploadFile);

// Multiple files upload (max 10)
router.post('/files', upload.array('files', 10), handleMulterError, uploadController.uploadFiles);

// Booking specific document
router.post('/booking', upload.single('document'), handleMulterError, uploadController.uploadBookingDocument);

// Get files for a specific booking
router.get('/booking/:bookingId', uploadController.getBookingFiles);

// Delete file
router.delete('/file/:id', uploadController.deleteFile);

module.exports = router;