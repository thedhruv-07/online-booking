const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

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

    // Send verification email (async, don't await)
    sendVerificationEmail(email, verificationToken, name).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user,
      token,
      message: 'Account created. Please check your email to verify your account.',
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ VERIFY EMAIL (GET for email links)
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.status = 'verified';
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('VERIFY EMAIL ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ VERIFY EMAIL (POST for frontend)
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.status = 'verified';
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('VERIFY EMAIL ERROR:', error);
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

    // Check user status
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended. Contact support.',
      });
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
      // For security, don't reveal that user doesn't exist
      return res.json({
        success: true,
        message: 'If email exists, reset link sent',
      });
    }

    // Allow pending users to reset password
    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Account suspended. Cannot reset password.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Send password reset email
    sendPasswordResetEmail(email, resetToken, user.name).catch(err => {
      console.error('Failed to send password reset email:', err);
    });

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

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Account suspended. Cannot reset password.',
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

/**
 * ================================
 * ✅ RESEND VERIFICATION
 * ================================
 */
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'verified') {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    sendVerificationEmail(user.email, token, user.name).catch(err => {
      console.error('Failed to resend verification email:', err);
    });

    res.json({
      success: true,
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;