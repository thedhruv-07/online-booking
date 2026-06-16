const fs = require('fs');
const path = require('path');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Core Brevo HTTP API send.
 * attachments: [{ filename, path?, content?, cid? }]
 *   - with cid  → inlineAttachments (embedded in HTML via cid:xxx)
 *   - without   → regular file attachments
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');

  const sender = {
    name: 'Absolute Veritas',
    email: process.env.FROM_EMAIL || 'cs@absoluteveritas.com',
  };

  const body = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const regular = attachments.filter(a => !a.cid);
  const inline  = attachments.filter(a =>  a.cid);

  if (regular.length) {
    body.attachment = regular.map(a => ({
      name: a.filename,
      content: a.content || fs.readFileSync(a.path).toString('base64'),
    }));
  }

  if (inline.length) {
    body.inlineAttachments = inline.map(a => ({
      name: a.filename,
      content: a.content || fs.readFileSync(a.path).toString('base64'),
      contentId: a.cid,
    }));
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API ${res.status}: ${err}`);
  }

  const result = await res.json();
  console.log(`✅ Email sent to ${to} | messageId: ${result.messageId}`);
  return result;
};

/**
 * Send booking confirmation to admin and client after payment is verified.
 */
const sendBookingEmail = async ({ user, booking, payment }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const appUrl     = process.env.FRONTEND_URL || 'http://localhost:5174';
  const backendUrl = process.env.BACKEND_URL  || 'http://localhost:3001';
  const logoPath   = path.join(__dirname, '..', '..', 'frontend', 'public', 'company-logo.png');
  const hasLogo    = fs.existsSync(logoPath);

  const logoAttachment = hasLogo
    ? [{ filename: 'company-logo.png', path: logoPath, cid: 'company-logo' }]
    : [];

  const logoImg = hasLogo
    ? `<img src="cid:company-logo" alt="Absolute Veritas" style="height:50px;margin-bottom:24px;" />`
    : `<p style="font-size:22px;font-weight:800;color:#0B3A70;margin:0 0 24px;">Absolute Veritas</p>`;

  const formatDate = d => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const amount     = payment?.amount?.toFixed(2) ?? booking.service?.totalAmount?.toFixed(2) ?? '0.00';
  const method     = (payment?.method || 'N/A').replace(/_/g, ' ').toUpperCase();
  const lotSize    = booking.aql?.lotSize ?? 'N/A';
  const level      = booking.aql?.inspectionLevel ?? 'N/A';
  const sampleSize = booking.aql?.sampleSize ?? 'N/A';
  const accept     = booking.aql?.acceptPoint ?? 'N/A';
  const reject     = booking.aql?.rejectPoint ?? 'N/A';
  const majorLimit = booking.aql?.majorDefectLimit ?? 'N/A';
  const minorLimit = booking.aql?.minorDefectLimit ?? 'N/A';

  const adminHtml = `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h2>New Booking Received</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:6px 0;color:#64748b;width:40%;">Name</td><td style="padding:6px 0;font-weight:600;">${user.name}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:600;">${user.email}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Booking ID</td><td style="padding:6px 0;font-family:monospace;">${booking._id}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Amount</td><td style="padding:6px 0;font-weight:600;">$${amount}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Method</td><td style="padding:6px 0;">${method}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Inspection Date</td><td style="padding:6px 0;">${formatDate(booking.inspectionDate)}</td></tr>
      </table>
    </div>`;

  const userHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;}
  .wrap{width:100%;background:#f4f5f7;padding:40px 0;}
  .card{background:#fff;margin:0 auto;max-width:600px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.05);overflow:hidden;}
  .header{text-align:center;padding:50px 40px 40px;border-bottom:1px solid #f0f0f0;}
  .title{margin:0;font-size:28px;font-weight:800;color:#111827;}
  .sub{margin:10px 0 0;font-size:16px;color:#6b7280;line-height:1.5;}
  .content{padding:40px;}
  .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:32px;}
  .box-title{margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0B3A70;}
  .badge{background:#dcfce7;color:#166534;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;}
  .sec{margin-bottom:32px;}
  .sec-title{font-size:17px;font-weight:700;color:#1e293b;border-bottom:2px solid #f1f5f9;padding-bottom:8px;margin:0 0 14px;}
  td.label{color:#64748b;width:42%;padding:9px 0;font-size:14px;border-bottom:1px solid #f1f5f9;}
  td.val{color:#0f172a;font-weight:500;font-size:14px;border-bottom:1px solid #f1f5f9;padding:9px 0;}
  .note{background:#EAF1F8;border-left:4px solid #0B3A70;padding:14px;border-radius:0 8px 8px 0;font-size:13px;color:#0B3A70;margin-top:14px;line-height:1.5;}
  .actions{padding:0 40px 40px;text-align:center;}
  .btn-p{display:inline-block;background:#F58220;color:#fff!important;text-decoration:none;padding:11px 24px;border-radius:6px;font-weight:600;margin:0 4px 10px;font-size:14px;}
  .btn-s{display:inline-block;background:#f8fafc;color:#475569!important;text-decoration:none;padding:11px 24px;border-radius:6px;font-weight:600;margin:0 4px 10px;font-size:14px;border:1px solid #e2e8f0;}
  .footer{text-align:center;padding:28px 40px;color:#94a3b8;font-size:13px;line-height:1.6;background:#fafafa;border-top:1px solid #f0f0f0;}
  .footer a{color:#64748b;}
</style></head><body>
<center class="wrap">
<table class="card" width="100%">
<tr><td class="header">
  ${logoImg}
  <h1 class="title">Booking Confirmed</h1>
  <p class="sub">Your inspection has been successfully scheduled.<br>We are excited to work with you!</p>
</td></tr>
<tr><td class="content">

  <div class="box">
    <div class="box-title">Booking Summary</div>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td class="label">Service</td><td class="val">${booking.service?.name || (booking.service?.selected || []).join(', ') || 'Inspection Service'}</td></tr>
      <tr><td class="label">Inspection Date</td><td class="val">${formatDate(booking.inspectionDate)}</td></tr>
      <tr><td class="label">Status</td><td class="val"><span class="badge">CONFIRMED</span></td></tr>
      <tr><td class="label" style="border:none;">Booking ID</td><td class="val" style="border:none;font-family:monospace;color:#64748b;">${booking._id}</td></tr>
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">Customer Details</div>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td class="label">Name</td><td class="val">${user.name}</td></tr>
      <tr><td class="label">Email</td><td class="val">${user.email}</td></tr>
      <tr><td class="label" style="border:none;">Phone</td><td class="val" style="border:none;">${user.phone || 'N/A'}</td></tr>
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">Payment Summary</div>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td class="label">Amount</td><td class="val" style="color:#F58220;font-weight:700;">$${amount}</td></tr>
      <tr><td class="label">Method</td><td class="val">${method}</td></tr>
      <tr><td class="label" style="border:none;">Status</td><td class="val" style="border:none;"><span class="badge">COMPLETED</span></td></tr>
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">AQL Inspection Details</div>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td class="label">Inspection Level</td><td class="val">${level}</td></tr>
      <tr><td class="label">Lot Size</td><td class="val">${typeof lotSize === 'number' ? lotSize.toLocaleString() : lotSize} units</td></tr>
      <tr><td class="label">Sample Size</td><td class="val" style="font-weight:700;">${sampleSize} units</td></tr>
      <tr><td class="label">Accept / Reject</td><td class="val">${accept} / ${reject} defects</td></tr>
      <tr><td class="label">Major AQL Limit</td><td class="val">${majorLimit}</td></tr>
      <tr><td class="label" style="border:none;">Minor AQL Limit</td><td class="val" style="border:none;">${minorLimit}</td></tr>
    </table>
    <div class="note"><strong>Note:</strong> Our certified inspector will randomly select ${sampleSize} units from your lot of ${typeof lotSize === 'number' ? lotSize.toLocaleString() : lotSize} units per ISO 2859-1.</div>
  </div>

</td></tr>
<tr><td class="actions">
  <a href="${appUrl}/dashboard/bookings/${booking._id}" class="btn-p">View Booking</a>
  <a href="${backendUrl}/api/invoice/download/${booking._id}" class="btn-s">Download Invoice</a>
</td></tr>
<tr><td class="footer">
  <p style="margin:0 0 6px;font-weight:600;color:#475569;">Absolute Veritas</p>
  <p style="margin:0 0 14px;">Questions? <a href="mailto:cs@absoluteveritas.com">cs@absoluteveritas.com</a></p>
  <p style="margin:0;font-size:11px;">&#169; ${new Date().getFullYear()} Absolute Veritas. All rights reserved.</p>
</td></tr>
</table>
</center>
</body></html>`;

  if (adminEmail) {
    await sendEmail({ to: adminEmail, subject: `New Booking: ${user.name} — $${amount}`, html: adminHtml });
  }

  await sendEmail({
    to: user.email,
    subject: `Booking Confirmed — ID: ${booking._id}`,
    html: userHtml,
    attachments: logoAttachment,
  });
};

/**
 * Send receipt notification after bank transfer receipt upload.
 * Admin gets the PDF attached; client gets a confirmation.
 */
const sendBookingReceiptEmail = async ({ user, booking, receiptPath }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const shortId    = booking._id.toString().slice(-8).toUpperCase();

  const formatDate = d => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  if (adminEmail) {
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;">
        <h2 style="color:#1e293b;">New Booking Payment Received</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:7px 0;color:#64748b;width:40%;">Booking ID</td><td style="padding:7px 0;font-weight:600;">${booking._id}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Client Name</td><td style="padding:7px 0;font-weight:600;">${user.name}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Client Email</td><td style="padding:7px 0;font-weight:600;">${user.email}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Inspection Type</td><td style="padding:7px 0;font-weight:600;">${(booking.service?.selected || []).join(', ') || 'N/A'}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Inspection Date</td><td style="padding:7px 0;font-weight:600;">${formatDate(booking.inspectionDate)}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Factory</td><td style="padding:7px 0;font-weight:600;">${booking.factory?.name || 'N/A'}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Amount</td><td style="padding:7px 0;font-weight:600;">${booking.service?.totalAmount ?? 'N/A'} ${booking.service?.currency || 'USD'}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;">Payment Method</td><td style="padding:7px 0;font-weight:600;">${(booking.payment?.method || 'N/A').replace(/_/g, ' ').toUpperCase()}</td></tr>
        </table>
        ${receiptPath ? '<p style="margin-top:14px;color:#475569;">Receipt is attached.</p>' : ''}
      </div>`;

    const receiptAttachment = receiptPath && fs.existsSync(receiptPath)
      ? [{ filename: path.basename(receiptPath), path: receiptPath }]
      : [];

    try {
      await sendEmail({
        to: adminEmail,
        subject: `New Booking Payment — #${shortId}`,
        html: adminHtml,
        attachments: receiptAttachment,
      });
    } catch (e) {
      console.error('Admin receipt email failed:', e.message);
    }
  }

  const clientEmail = booking.userId?.email || user.email;
  const clientName  = booking.userId?.name  || user.name;

  const clientHtml = `
    <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;">
      <h2 style="color:#1e293b;">Payment Receipt Received</h2>
      <p>Dear ${clientName},</p>
      <p>We have received your payment receipt. Our team will verify your payment and confirm your booking within 1–2 business days.</p>
      <h3 style="color:#374151;margin-top:22px;">Booking Details</h3>
      <ul style="line-height:2.2;">
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Inspection Type:</strong> ${(booking.service?.selected || []).join(', ') || 'N/A'}</li>
        <li><strong>Inspection Date:</strong> ${formatDate(booking.inspectionDate)}</li>
        <li><strong>Amount:</strong> ${booking.service?.totalAmount ?? 'N/A'} ${booking.service?.currency || 'USD'}</li>
      </ul>
      <p style="margin-top:22px;">Questions? <a href="mailto:cs@absoluteveritas.com">cs@absoluteveritas.com</a></p>
    </div>`;

  await sendEmail({
    to: clientEmail,
    subject: `Payment Receipt Received — Booking #${shortId}`,
    html: clientHtml,
  });
};

/**
 * Notify admin when a user marks Razorpay payment as completed (manual verification required).
 */
const sendRazorpayNotificationEmail = async ({ user, booking }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const shortId    = booking._id.toString().slice(-8).toUpperCase();
  const formatDate = d => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;">
      <h2 style="color:#1e293b;">Razorpay Payment Submitted — Awaiting Verification</h2>
      <p style="color:#475569;">A client has completed payment via Razorpay and is waiting for confirmation.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:14px;">
        <tr><td style="padding:7px 0;color:#64748b;width:40%;">Booking ID</td><td style="padding:7px 0;font-weight:600;">${booking._id}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Client Name</td><td style="padding:7px 0;font-weight:600;">${user.name}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Client Email</td><td style="padding:7px 0;font-weight:600;">${user.email}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Inspection Type</td><td style="padding:7px 0;font-weight:600;">${(booking.service?.selected || []).join(', ') || 'N/A'}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Inspection Date</td><td style="padding:7px 0;font-weight:600;">${formatDate(booking.inspectionDate)}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Amount</td><td style="padding:7px 0;font-weight:600;">${booking.service?.totalAmount ?? 'N/A'} ${booking.service?.currency || 'USD'}</td></tr>
      </table>
      <p style="margin-top:18px;color:#dc2626;font-weight:600;">Action required: Verify payment on the Razorpay dashboard and confirm the booking manually.</p>
    </div>`;

  try {
    await sendEmail({
      to: adminEmail,
      subject: `Razorpay Payment Submitted — Booking #${shortId} (${user.name})`,
      html,
    });
  } catch (e) {
    console.error('Razorpay notification email failed:', e.message);
  }
};

module.exports = { sendEmail, sendBookingEmail, sendBookingReceiptEmail, sendRazorpayNotificationEmail };
