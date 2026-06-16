const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Absolute Veritas', email: process.env.FROM_EMAIL || 'cs@absoluteveritas.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API ${res.status}: ${err}`);
  }

  const result = await res.json();
  console.log(`✅ Email sent to ${to} | messageId: ${result.messageId}`);
  return { messageId: result.messageId };
};

const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#0B3A70;">Welcome to Absolute Veritas, ${name}!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <p style="margin:24px 0;">
        <a href="${verificationUrl}" style="background:#F58220;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">Verify Email</a>
      </p>
      <p style="color:#64748b;font-size:14px;">Or copy this link into your browser:<br><code style="color:#475569;">${verificationUrl}</code></p>
      <p style="color:#94a3b8;font-size:13px;margin-top:24px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    </div>`;
  return sendEmail(email, 'Verify your email — Absolute Veritas', html);
};

const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#0B3A70;">Password Reset — Absolute Veritas</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Click the button below to set a new one:</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="background:#F58220;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">Reset Password</a>
      </p>
      <p style="color:#64748b;font-size:14px;">Or copy this link:<br><code style="color:#475569;">${resetUrl}</code></p>
      <p style="color:#94a3b8;font-size:13px;margin-top:24px;">This link expires in 1 hour. If you didn't request this, please ignore.</p>
    </div>`;
  return sendEmail(email, 'Reset your password — Absolute Veritas', html);
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
