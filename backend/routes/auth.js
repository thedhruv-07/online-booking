const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const { auth } = require('../middleware/auth');
console.log("🔥 AUTH ROUTE LOADED");
const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * ✅ SIGNUP
 */
router.post('/signup', async (req, res) => {
  try {
    console.log("SIGNUP HIT");

    const { email, password, name, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      password,
      name,
      phone,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user,
      token,
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      user,
      token,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});
/**
 * ================================
 * ✅ GET PROFILE
 * ================================
 */
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/**
 * ================================
 * ✅ REFRESH TOKEN
 * ================================
 */
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = generateToken(req.user._id);

    res.json({ token });
  } catch (error) {
    console.error("REFRESH ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/**
 * ================================
 * ✅ LOGOUT
 * ================================
 */
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

/**
 * ================================
 * ✅ FORGOT PASSWORD
 * ================================
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: 'If email exists, reset link sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    res.json({
      success: true,
      message: 'If email exists, reset link sent',
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/**
 * ================================
 * ✅ RESET PASSWORD
 * ================================
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;