const express = require('express');
const {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  getProfile,
  updateProfile,
  updatePassword,
  logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification', resendVerification);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/update-password', auth, updatePassword);

module.exports = router;