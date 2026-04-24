const nodemailer = require('nodemailer');
const path = require('path');

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
const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const transporter = await createTransporter();
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@bookingapp.com';
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
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
  const companyName = 'Absolute Veritas';
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const logoUrl = 'cid:company-logo'; // Use CID for inline image
  const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'company-logo.png');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // --- ADMIN EMAIL HTML (Data Dense) ---
  const adminHtmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Booking Received</h2>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>
      <p><strong>Payment Amount:</strong> $${payment.amount}</p>
      <p><strong>Method:</strong> ${payment.method}</p>
    </div>
  `;

  // --- USER EMAIL HTML (Premium SaaS Template) ---
  // AQL Data Extraction
  const lotSize = booking.aql?.lotSize || 'N/A';
  const strictness = booking.aql?.strictnessMode ? booking.aql.strictnessMode.charAt(0).toUpperCase() + booking.aql.strictnessMode.slice(1) : 'Standard';
  const quality = booking.aql?.qualityMode ? booking.aql.qualityMode.charAt(0).toUpperCase() + booking.aql.qualityMode.slice(1) : 'Standard';
  const sampleSize = booking.aql?.sampleSize || 'N/A';

  const userHtmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f4f5f7; padding: 40px 0; }
  .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
  .header { text-align: center; padding: 50px 40px 40px; border-bottom: 1px solid #f0f0f0; background-color: #ffffff; }
  .logo { height: 50px; margin-bottom: 24px; }
  .title { margin: 0; font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
  .subtitle { margin: 10px 0 0; font-size: 16px; color: #6b7280; line-height: 1.5; }
  .content { padding: 40px; }
  
  .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
  .summary-title { margin: 0 0 16px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; }
  .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
  .summary-label { color: #64748b; font-weight: 500; padding-bottom: 12px; }
  .summary-val { color: #0f172a; font-weight: 600; text-align: right; padding-bottom: 12px; }
  .badge-green { background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; display: inline-block; }
  
  .section { margin-bottom: 32px; }
  .section-title { margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table td { padding: 10px 0; font-size: 15px; border-bottom: 1px solid #f1f5f9; }
  .data-table td:first-child { color: #64748b; width: 40%; }
  .data-table td:last-child { color: #0f172a; font-weight: 500; }
  
  .inspection-note { background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 16px; font-size: 14px; color: #3730a3; font-weight: 500; line-height: 1.5; }
  
  .actions { padding: 0 40px 40px; text-align: center; }
  .btn-primary { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 500; margin: 0 4px 12px; text-align: center; font-size: 14px; }
  .btn-secondary { display: inline-block; background-color: #f8fafc; color: #475569 !important; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 500; margin: 0 4px 12px; text-align: center; font-size: 14px; border: 1px solid #e2e8f0; }
  
  .footer { text-align: center; padding: 30px 40px; color: #94a3b8; font-size: 13px; line-height: 1.6; }
  .footer a { color: #64748b; text-decoration: underline; }
</style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <div style="margin-bottom: 24px;">
            <img src="${logoUrl}" alt="${companyName}" class="logo" />
          </div>
          <h1 class="title">Booking Confirmed 🎉</h1>
          <p class="subtitle">Your inspection has been successfully scheduled.<br>We are excited to work with you!</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          
          <!-- Primary Summary Card -->
          <div class="summary-card">
            <h2 class="summary-title">📦 Booking Summary</h2>
            <table width="100%">
              <tr>
                <td class="summary-label">Service:</td>
                <td class="summary-val">${booking.service?.name || 'Inspection Service'}</td>
              </tr>
              <tr>
                <td class="summary-label">Date:</td>
                <td class="summary-val">${formatDate(booking.createdAt)}</td>
              </tr>
              <tr>
                <td class="summary-label">Status:</td>
                <td class="summary-val"><span class="badge-green">CONFIRMED</span></td>
              </tr>
              <tr>
                <td class="summary-label" style="border: none; padding-bottom: 0;">Booking ID:</td>
                <td class="summary-val" style="border: none; padding-bottom: 0; font-family: monospace; color: #64748b;">${booking._id}</td>
              </tr>
            </table>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3 class="section-title">👤 Customer Details</h3>
            <table class="data-table">
              <tr><td>Name</td><td>${user.name}</td></tr>
              <tr><td>Email</td><td>${user.email}</td></tr>
              <tr><td>Phone</td><td>${user.phone || 'N/A'}</td></tr>
            </table>
          </div>

          <!-- Payment Details -->
          <div class="section">
            <h3 class="section-title">💳 Payment Summary</h3>
            <table class="data-table">
              <tr><td>Amount Paid</td><td style="font-weight: 700; color: #4f46e5;">$${payment.amount?.toFixed(2) || '0.00'}</td></tr>
              <tr><td>Payment Method</td><td>${payment.method.replace('_', ' ').toUpperCase()}</td></tr>
              <tr><td>Status</td><td><span class="badge-green">COMPLETED</span></td></tr>
            </table>
          </div>

          <!-- Inspection Details -->
          <div class="section">
            <h3 class="section-title">📊 Inspection Details</h3>
            <table class="data-table">
              <tr><td>Total Lot Size</td><td>${lotSize.toLocaleString()} units</td></tr>
              <tr><td>Inspection Strictness</td><td>${strictness}</td></tr>
              <tr><td>Quality Level</td><td>${quality} Quality</td></tr>
              <tr><td>Sample Size</td><td style="font-weight: 700;">${sampleSize} units</td></tr>
            </table>
            
            <div class="inspection-note">
              <strong>Note:</strong> Our certified inspector will randomly select and thoroughly check ${sampleSize} units from your batch based on your selected quality standards.
            </div>
          </div>

        </td>
      </tr>
      <tr>
        <td class="actions">
          <a href="${appUrl}/dashboard/bookings/${booking._id}" class="btn-primary" style="color: white !important;">View Booking</a>
          <a href="${backendUrl}/api/invoice/download/${booking._id}" class="btn-secondary" style="color: #4f46e5 !important;">Download Invoice</a>
        </td>
      </tr>
      <tr>
        <td class="footer" style="background-color: #fafafa; border-top: 1px solid #f0f0f0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #475569;">${companyName}</p>
          <p style="margin: 0 0 16px;">If you have any questions or need to make changes, <br>please <a href="mailto:support@absoluteveritas.com">contact our support team</a>.</p>
          <p style="margin: 0; font-size: 11px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `;

  // 1. Send to Admin
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `📢 New Booking: ${user.name} - $${payment.amount}`,
      html: adminHtmlContent,
      attachments: [
        {
          filename: 'company-logo.png',
          path: logoPath,
          cid: 'company-logo'
        }
      ]
    });
  }

  // 2. Send to User
  await sendEmail({
    to: user.email,
    subject: `✅ Booking Confirmed - ID: ${booking._id}`,
    html: userHtmlContent,
    attachments: [
      {
        filename: 'company-logo.png',
        path: logoPath,
        cid: 'company-logo'
      }
    ]
  });
};

module.exports = {
  sendEmail,
  sendBookingEmail
};
