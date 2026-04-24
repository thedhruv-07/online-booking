const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const app = express();

/**
 * ✅ Middlewares
 */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, ""));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Clean current origin to match
    const cleanOrigin = origin.replace(/\/$/, "");
    
    if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * ✅ API Routes
 */
app.use('/api', apiRoutes);

/**
 * ✅ Error Handling
 */
app.use(errorHandler);

/**
 * ✅ Database Connection & Server Start
 */
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Network access via http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Global unhandled rejection handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});