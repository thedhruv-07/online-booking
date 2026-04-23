const nodemailer = require('nodemailer');

let cachedTransporter = null;

// Create transporter
const createTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    const isGmail = (process.env.SMTP_HOST || '').includes('gmail.com');
    const transporter = nodemailer.createTransport(isGmail ? {
      service: 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    } : {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465 || !process.env.SMTP_PORT,
      auth: {
        user: user,
        pass: pass,
      },
    });

    try {
      await transporter.verify();
      cachedTransporter = transporter;
      return transporter;
    } catch (error) {
      console.error('❌ SMTP CONNECTION ERROR:', error.message);
      throw error;
    }
  }

  // Fallback to Ethereal
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
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@bookingapp.com';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send Booking Email to Admin and User
 */
const sendBookingEmail = async ({ user, booking, payment }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  const commonStyle = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 10px;
  `;

  const headerStyle = `
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 10px 10px 0 0;
    text-align: center;
    border-bottom: 2px solid #007bff;
  `;

  const sectionStyle = `
    margin: 20px 0;
    padding: 15px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  `;

  const labelStyle = `
    font-weight: bold;
    color: #555;
    width: 120px;
    display: inline-block;
  `;

  const htmlContent = `
    <div style="${commonStyle}">
      <div style="${headerStyle}">
        <h2 style="margin:0; color: #007bff;">New Booking Received</h2>
        <p style="margin: 5px 0 0; color: #666;">Payment Successful</p>
      </div>

      <div style="${sectionStyle}">
        <h3 style="margin-top:0; border-bottom: 1px solid #eee; padding-bottom: 10px;">--- USER DETAILS ---</h3>
        <p><span style="${labelStyle}">Name:</span> ${user.name}</p>
        <p><span style="${labelStyle}">Email:</span> ${user.email}</p>
        <p><span style="${labelStyle}">Phone:</span> ${user.phone || 'N/A'}</p>
      </div>

      <div style="${sectionStyle}">
        <h3 style="margin-top:0; border-bottom: 1px solid #eee; padding-bottom: 10px;">--- BOOKING DETAILS ---</h3>
        <p><span style="${labelStyle}">Booking ID:</span> <code>${booking._id}</code></p>
        <p><span style="${labelStyle}">Service:</span> ${booking.service?.name || 'Inspection Service'}</p>
        <p><span style="${labelStyle}">Date:</span> ${new Date(booking.createdAt).toLocaleDateString()}</p>
        <p><span style="${labelStyle}">Status:</span> <span style="color: #28a745; font-weight:bold;">${booking.status.toUpperCase()}</span></p>
      </div>

      <div style="${sectionStyle}">
        <h3 style="margin-top:0; border-bottom: 1px solid #eee; padding-bottom: 10px;">--- PAYMENT DETAILS ---</h3>
        <p><span style="${labelStyle}">Payment ID:</span> <code>${payment._id}</code></p>
        <p><span style="${labelStyle}">Amount:</span> <strong>$${payment.amount}</strong></p>
        <p><span style="${labelStyle}">Method:</span> ${payment.method.replace('_', ' ').toUpperCase()}</p>
        <p><span style="${labelStyle}">Status:</span> <span style="color: #28a745; font-weight:bold;">${payment.status.toUpperCase()}</span></p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        <p>This is an automated notification from Booking App.</p>
      </div>
    </div>
  `;

  // 1. Send to Admin
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `📢 New Booking: ${user.name} - $${payment.amount}`,
      html: htmlContent
    });
  }

  // 2. Send to User (Bonus)
  const userHtmlContent = htmlContent.replace('New Booking Received', 'Booking Confirmed!');
  await sendEmail({
    to: user.email,
    subject: `✅ Booking Confirmed - ID: ${booking._id}`,
    html: userHtmlContent
  });
};

module.exports = {
  sendEmail,
  sendBookingEmail
};
