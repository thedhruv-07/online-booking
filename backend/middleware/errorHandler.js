class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong',
  });
};

module.exports = { errorHandler, AppError };