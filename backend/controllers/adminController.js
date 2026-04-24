const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorHandler');

/**
 * ✅ Get all users (Admin only)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { status, role, limit = 50, offset = 0 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ users, total, limit: Number(limit), offset: Number(offset) });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get all bookings (Admin only)
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, paymentStatus, limit = 50, offset = 0 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ bookings, total, limit: Number(limit), offset: Number(offset) });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get all payments (Admin only)
 */
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({ payments, total, limit: Number(limit), offset: Number(offset) });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get dashboard stats (Admin only)
 */
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: 'completed' });

    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const revenue = revenueResult[0]?.total || 0;

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalBookings,
      totalPayments,
      revenue,
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};
