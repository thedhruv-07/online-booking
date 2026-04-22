const mongoose = require('mongoose');
const User = require('./models/User');
const { sendVerificationEmail } = require('./utils/email');
const crypto = require('crypto');
require('dotenv').config();

async function resendVerification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'dhruvsingh200420@gmail.com';
    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.verificationToken = token;
      user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      console.log('User found, sending verification email...');
      await sendVerificationEmail(user.email, token, user.name);
      console.log('Check your terminal for the PREVIEW LINK!');
    } else {
      console.log('User not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resendVerification();
