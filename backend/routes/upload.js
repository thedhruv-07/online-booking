const express = require('express');
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../utils/storage');

const router = express.Router();

router.use(auth);

router.post('/file', upload.single('file'), handleMulterError, uploadController.uploadFile);

router.post('/files', upload.array('files', 10), handleMulterError, uploadController.uploadFiles);

router.post('/booking', upload.single('document'), handleMulterError, uploadController.uploadBookingDocument);

router.get('/booking/:bookingId', uploadController.getBookingFiles);

router.delete('/file/:id', uploadController.deleteFile);

module.exports = router;