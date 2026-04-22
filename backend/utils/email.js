const nodemailer = require('nodemailer');

let cachedTransporter = null;

// Create transporter
const createTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // Use real credentials if SMTP_USER is provided
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail = (process.env.SMTP_HOST || '').includes('gmail.com');
    const transporter = nodemailer.createTransport(isGmail ? {
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } : {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465 || !process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Test the connection
    try {
      await transporter.verify();
      console.log('✅ SMTP CONNECTION SUCCESSFUL - Real emails will be sent!');
      cachedTransporter = transporter;
      return transporter;
    } catch (error) {
      console.error('❌ SMTP CONNECTION ERROR:', error.message);
      console.log('👉 Tip: Ensure you are using an "App Password", not your regular password.');
      throw error;
    }
  }

  // Fallback to Ethereal
  console.log('ℹ️ No SMTP credentials - Using Ethereal (Test Mode)');
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<{messageId: string, previewUrl?: string}>}
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();
    const from = process.env.FROM_EMAIL || 'noreply@bookingapp.com';
    console.log(`-----------------------------------`);
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully! ID: ${info.messageId}`);
    // If using ethereal, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\x1b[36m%s\x1b[0m`, `🔗 PREVIEW LINK (CLICK THIS): ${previewUrl}`);
      console.log(`-----------------------------------`);
      return { messageId: info.messageId, previewUrl };
    }
    return { messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send verification email
 * @param {string} email
 * @param {string} token
 * @param {string} name
 */
const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const subject = 'Verify your email - Booking App';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Booking App, ${name}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><code>${verificationUrl}</code></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

/**
 * Send password reset email
 * @param {string} email
 * @param {string} token
 * @param {string} name
 */
const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const subject = 'Reset your password - Booking App';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><code>${resetUrl}</code></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};

// Startup check - test the connection immediately
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  createTransporter().then(() => {
    // Connection test is triggered inside createTransporter
  }).catch(err => {
    console.error('❌ SMTP INITIALIZATION FAILED:', err.message);
  });
} else {
  console.log('ℹ️ No SMTP credentials - Using Ethereal (Test Mode)');
}