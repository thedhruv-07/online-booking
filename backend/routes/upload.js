const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Upload = require('../models/Upload');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('File type not allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

router.post('/file', auth, upload.single('file'), handleMulterError, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const file = await Upload.create({
      userId: req.user._id,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      category: 'file',
    });

    res.status(201).json({
      id: file._id,
      name: file.name,
      url: file.url,
      size: file.size,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/files', auth, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        return Upload.create({
          userId: req.user._id,
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          size: file.size,
          type: file.mimetype,
          category: 'file',
        });
      })
    );

    res.status(201).json(
      uploads.map((file) => ({
        id: file._id,
        name: file.name,
        url: file.url,
        size: file.size,
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/booking', auth, upload.single('document'), handleMulterError, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No document uploaded', 400);
    }

    const file = await Upload.create({
      userId: req.user._id,
      bookingId: req.body.bookingId,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      category: 'booking',
    });

    res.status(201).json({
      id: file._id,
      url: file.url,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/file/:id', auth, async (req, res, next) => {
  try {
    const file = await Upload.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    const filePath = path.join(__dirname, '..', file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/booking/:bookingId', auth, async (req, res, next) => {
  try {
    const files = await Upload.find({
      bookingId: req.params.bookingId,
      userId: req.user._id,
    });

    res.json(
      files.map((file) => ({
        id: file._id,
        name: file.name,
        url: file.url,
        size: file.size,
        type: file.type,
      }))
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;