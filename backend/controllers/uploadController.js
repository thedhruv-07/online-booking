const Upload = require('../models/Upload');
const { AppError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

/**
 * ✅ Upload single file
 */
exports.uploadFile = async (req, res, next) => {
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
};

/**
 * ✅ Upload multiple files
 */
exports.uploadFiles = async (req, res, next) => {
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
};

/**
 * ✅ Upload booking document
 */
exports.uploadBookingDocument = async (req, res, next) => {
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
};

/**
 * ✅ Delete file
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const file = await Upload.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    const filePath = path.join(__dirname, '..', '..', file.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get files for a booking
 */
exports.getBookingFiles = async (req, res, next) => {
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
};
