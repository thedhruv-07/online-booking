const requireApiSecret = (req, res, next) => {
  const secret = req.headers['x-api-secret'];
  if (!secret || !process.env.BOOKING_API_SECRET || secret !== process.env.BOOKING_API_SECRET) {
    return res.status(401).json({ message: 'Invalid or missing API secret' });
  }
  next();
};

module.exports = { requireApiSecret };
