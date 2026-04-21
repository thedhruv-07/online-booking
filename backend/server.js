const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

/**
 * ✅ Connect DB
 */
connectDB();

/**
 * ✅ Ensure uploads folder exists
 */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * ✅ Middlewares
 */
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Static files
 */
app.use('/uploads', express.static(uploadDir));

/**
 * ✅ Routes
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

/**
 * ✅ Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * ❌ 404 API handler
 */
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      message: 'API endpoint not found',
    });
  }
});

/**
 * 🔥 ERROR HANDLER (MUST BE LAST)
 */
app.use(errorHandler);

/**
 * ✅ Start server
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});