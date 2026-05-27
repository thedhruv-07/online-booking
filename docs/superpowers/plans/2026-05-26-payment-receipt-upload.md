# Payment Receipt Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add receipt upload to the PaymentStep wizard (for both Razorpay and bank transfer), and send admin + client notification emails with the receipt when it is uploaded.

**Architecture:** The PaymentStep is restructured from a single-page flow into a three-stage component (method selection → payment details → receipt upload). The backend gains a new `POST /payments/bank-receipt` endpoint that stores the file, updates the booking, and emails both admin and client. No existing payment flows are broken — the MyBookings bank-transfer upload modal is left untouched as a fallback.

**Tech Stack:** React 19 + Vite (frontend), Express + Mongoose + Multer + Nodemailer (backend)

---

## File Map

| File | Change |
|------|--------|
| `backend/utils/sendEmail.js` | Add `sendBookingReceiptEmail({ user, booking, receiptPath })` function, export it |
| `backend/controllers/paymentController.js` | Add `uploadBankReceipt` controller; update `require` import to include `sendBookingReceiptEmail` |
| `backend/routes/payments.js` | Add `POST /bank-receipt` route before the `/:id` parameterised routes |
| `backend/.env` | Ensure `ADMIN_EMAIL=cs@absoluteveritas.com` is present |
| `frontend/src/services/payment.service.js` | Add optional `method` parameter to `uploadBankReceipt` |
| `frontend/src/components/steps/PaymentStep.jsx` | Full redesign: method-select → details → upload stages |

---

## Task 1: Add `sendBookingReceiptEmail` to `backend/utils/sendEmail.js`

**Files:**
- Modify: `backend/utils/sendEmail.js`

- [ ] **Step 1: Add `sendBookingReceiptEmail` function**

Add the following function immediately before the `module.exports` block in `backend/utils/sendEmail.js`:

```js
/**
 * Send receipt notification emails after a receipt is uploaded.
 * Admin gets the file as an attachment; client gets a confirmation only.
 * @param {{ user: Object, booking: Object, receiptPath: string|null }} opts
 */
const sendBookingReceiptEmail = async ({ user, booking, receiptPath }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const shortId = booking._id.toString().slice(-8).toUpperCase();

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // --- Admin email (with receipt attachment) ---
  if (adminEmail) {
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #1e293b;">New Booking Payment Received</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Booking ID</td><td style="padding: 8px 0; font-weight: 600;">${booking._id}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Client Name</td><td style="padding: 8px 0; font-weight: 600;">${user.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Client Email</td><td style="padding: 8px 0; font-weight: 600;">${user.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Inspection Type</td><td style="padding: 8px 0; font-weight: 600;">${(booking.service?.selected || []).join(', ') || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Inspection Date</td><td style="padding: 8px 0; font-weight: 600;">${formatDate(booking.inspectionDate)}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Factory</td><td style="padding: 8px 0; font-weight: 600;">${booking.factory?.name || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Amount</td><td style="padding: 8px 0; font-weight: 600;">${booking.service?.totalAmount} ${booking.service?.currency || 'USD'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Payment Method</td><td style="padding: 8px 0; font-weight: 600;">${(booking.payment?.method || 'N/A').replace('_', ' ').toUpperCase()}</td></tr>
        </table>
        ${receiptPath ? '<p style="margin-top: 16px; color: #475569;">Receipt is attached to this email.</p>' : '<p style="margin-top: 16px; color: #94a3b8;">No receipt file was uploaded.</p>'}
      </div>
    `;
    await sendEmail({
      to: adminEmail,
      subject: `New Booking Payment Received — Booking #${shortId}`,
      html: adminHtml,
      attachments: receiptPath ? [{ path: receiptPath }] : [],
    });
  }

  // --- Client email (no attachment) ---
  const clientEmail = booking.userId?.email || user.email;
  const clientName = booking.userId?.name || user.name;
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Payment Receipt Received</h2>
      <p>Dear ${clientName},</p>
      <p>We have received your payment receipt for your inspection booking. Our team will verify your payment and confirm your booking within 1–2 business days.</p>
      <h3 style="color: #374151; margin-top: 24px;">Booking Details</h3>
      <ul style="line-height: 2;">
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Inspection Type:</strong> ${(booking.service?.selected || []).join(', ') || 'N/A'}</li>
        <li><strong>Inspection Date:</strong> ${formatDate(booking.inspectionDate)}</li>
        <li><strong>Amount:</strong> ${booking.service?.totalAmount} ${booking.service?.currency || 'USD'}</li>
      </ul>
      <p style="margin-top: 24px;">If you have any questions, contact us at <a href="mailto:cs@absoluteveritas.com">cs@absoluteveritas.com</a></p>
    </div>
  `;
  await sendEmail({
    to: clientEmail,
    subject: `Payment Receipt Received — Booking #${shortId}`,
    html: clientHtml,
  });
};
```

- [ ] **Step 2: Export the new function**

Update the `module.exports` at the bottom of `backend/utils/sendEmail.js`:

```js
module.exports = {
  sendEmail,
  sendBookingEmail,
  sendBookingReceiptEmail,
};
```

- [ ] **Step 3: Commit**

```bash
git add backend/utils/sendEmail.js
git commit -m "feat: add sendBookingReceiptEmail to notify admin and client on receipt upload"
```

---

## Task 2: Add `uploadBankReceipt` controller to `backend/controllers/paymentController.js`

**Files:**
- Modify: `backend/controllers/paymentController.js`

- [ ] **Step 1: Update the `require` import at the top of `paymentController.js`**

Find line 4:
```js
const { sendBookingEmail } = require('../utils/sendEmail');
```
Replace with:
```js
const { sendBookingEmail, sendBookingReceiptEmail } = require('../utils/sendEmail');
```

- [ ] **Step 2: Add the `uploadBankReceipt` controller function**

Append the following at the end of `backend/controllers/paymentController.js` (after `exports.refundPayment`):

```js
/**
 * ✅ Upload bank/payment receipt by booking ID
 * POST /payments/bank-receipt
 * Body: bookingId (string), method (string, optional, default: 'bank_transfer')
 * File: receipt (via multer)
 */
exports.uploadBankReceipt = async (req, res, next) => {
  try {
    const { bookingId, method = 'bank_transfer' } = req.body;

    if (!bookingId) {
      throw new AppError('bookingId is required', 400);
    }

    if (!req.file) {
      throw new AppError('Receipt file is required', 400);
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id })
      .populate('userId', 'name email');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    booking.payment.receiptFile = {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
    };
    booking.payment.method = method;
    // payment.status intentionally stays 'pending' — admin confirms manually
    await booking.save();

    try {
      await sendBookingReceiptEmail({
        user: req.user,
        booking,
        receiptPath: req.file.path,
      });
    } catch (emailErr) {
      console.error('Failed to send receipt emails:', emailErr.message);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add backend/controllers/paymentController.js
git commit -m "feat: add uploadBankReceipt controller — stores receipt, sends admin + client emails"
```

---

## Task 3: Wire the route in `backend/routes/payments.js`

**Files:**
- Modify: `backend/routes/payments.js`

- [ ] **Step 1: Add the route**

In `backend/routes/payments.js`, add the `/bank-receipt` route **before** the `/:id` parameterised routes. The final file should look like this:

```js
const express = require('express');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../utils/storage');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);

// bank-receipt must be registered before /:id routes to avoid route collision
router.post(
  '/bank-receipt',
  upload.single('receipt'),
  handleMulterError,
  paymentController.uploadBankReceipt
);

router.get('/:id', paymentController.getPaymentById);
router.post('/verify/paypal', paymentController.verifyPayPal);
router.post('/demo-success', paymentController.demoSuccess);
router.post('/:id/refund', paymentController.refundPayment);

// Bank transfer with receipt upload (legacy — uses Payment document ID)
router.post(
  '/:id/bank-transfer',
  upload.single('receipt'),
  handleMulterError,
  paymentController.handleBankTransfer
);

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add backend/routes/payments.js
git commit -m "feat: add POST /payments/bank-receipt route"
```

---

## Task 4: Set `ADMIN_EMAIL` in `backend/.env`

**Files:**
- Modify: `backend/.env`

- [ ] **Step 1: Verify / add `ADMIN_EMAIL`**

Open `backend/.env`. Ensure this line is present (`.env.example` already has it as `ADMIN_EMAIL=admin@example.com` — update to the real address):

```
ADMIN_EMAIL=cs@absoluteveritas.com
```

- [ ] **Step 2: No commit needed** — `.env` is gitignored. This is a runtime configuration step only.

---

## Task 5: Update `uploadBankReceipt` in `frontend/src/services/payment.service.js`

**Files:**
- Modify: `frontend/src/services/payment.service.js`

- [ ] **Step 1: Add `method` parameter**

Find the `uploadBankReceipt` method (lines 125–130) and replace it with:

```js
  /**
   * Upload bank transfer receipt by booking ID
   * @param {string} bookingId
   * @param {File} file - Receipt image/PDF
   * @param {string} [method='bank_transfer'] - Payment method to record on the booking
   * @returns {Promise<{success: boolean}>}
   */
  uploadBankReceipt: async (bookingId, file, method = 'bank_transfer') => {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('receipt', file);
    formData.append('method', method);
    return api.uploadFile('/payments/bank-receipt', formData);
  },
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/payment.service.js
git commit -m "feat: add method param to uploadBankReceipt service"
```

---

## Task 6: Rewrite `frontend/src/components/steps/PaymentStep.jsx`

**Files:**
- Modify: `frontend/src/components/steps/PaymentStep.jsx`

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `frontend/src/components/steps/PaymentStep.jsx` with:

```jsx
import { useState } from 'react';
import { ExternalLink, ArrowRight, ArrowLeft, Hash, Building2, CreditCard, Upload } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/payment.service';
import { bookingService } from '../../services/booking.service';

const BANK_DETAILS = [
  { label: 'Beneficiary',   value: 'Absolute Veritas' },
  { label: 'Account No.',   value: '50200037111753' },
  { label: 'IFSC Code',     value: 'HDFC0000093' },
  { label: 'Bank',          value: 'HDFC Bank' },
  { label: 'SWIFT',         value: 'HDFCINBB' },
  { label: 'Branch',        value: 'HDFC Bank, NIT-5 Faridabad' },
];

const PaymentStep = () => {
  const { bookingData, clearDraft } = useBooking();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState(null); // 'razorpay' | 'bank_transfer'
  const [stage, setStage] = useState('select');             // 'select' | 'details' | 'upload'
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const bookingId    = bookingData.payment?.bookingId;
  const totalAmount  = bookingData.payment?.totalAmount ?? bookingData.service?.totalAmount ?? 0;
  const serviceName  = bookingData.payment?.serviceName || bookingData.service?.name || 'Inspection Service';
  const shortId      = bookingId ? `#${bookingId.slice(-8).toUpperCase()}` : '—';

  const finishAndNavigate = () => {
    clearDraft();
    navigate('/dashboard/bookings');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setUploadError('Please upload a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10 MB.');
      return;
    }
    setReceiptFile(file);
    setUploadError('');
  };

  const handleUploadAndFinish = async () => {
    setIsUploading(true);
    setUploadError('');
    try {
      await paymentService.uploadBankReceipt(bookingId, receiptFile, paymentMethod);
      finishAndNavigate();
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleSkipAndFinish = async () => {
    try {
      await bookingService.updateBooking(bookingId, {
        payment: { method: 'razorpay', status: 'pending' },
      });
    } catch (err) {
      console.error('Failed to update booking payment method:', err.message);
    }
    finishAndNavigate();
  };

  // ─── Stage: select ────────────────────────────────────────────────────────
  if (stage === 'select') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 space-y-8 max-w-xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Payment Method</h2>
          <p className="text-slate-500 font-medium">How would you like to pay?</p>
        </div>

        <div className="w-full space-y-4">
          {/* Pay Online */}
          <button
            onClick={() => { setPaymentMethod('razorpay'); setStage('details'); }}
            className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <CreditCard size={24} className="text-indigo-600" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">Pay Online</div>
                <div className="text-sm text-slate-500 font-medium">Razorpay / UPI / Net Banking / Card</div>
              </div>
              <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => { setPaymentMethod('bank_transfer'); setStage('details'); }}
            className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Building2 size={24} className="text-emerald-600" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">Bank Transfer</div>
                <div className="text-sm text-slate-500 font-medium">Direct transfer with receipt upload</div>
              </div>
              <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ─── Stage: details ───────────────────────────────────────────────────────
  if (stage === 'details') {
    return (
      <div className="flex flex-col items-center min-h-[60vh] py-16 space-y-8 max-w-xl mx-auto">
        {/* Back */}
        <button
          onClick={() => setStage('select')}
          className="self-start flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Booking summary */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Hash size={12} /> Booking Reference
            </span>
            <span className="font-black text-indigo-600 text-lg">{shortId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Service</span>
            <span className="text-sm font-bold text-slate-800">{serviceName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Amount Due</span>
            <span className="text-xl font-black text-slate-900">${Number(totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Razorpay details */}
        {paymentMethod === 'razorpay' && (
          <>
            <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-amber-800 mb-2">How to complete payment:</p>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal ml-4 font-medium">
                <li>Click <strong>"Proceed to Payment"</strong> below</li>
                <li>Enter <strong>{shortId}</strong> in the <em>Invoice No. / Project Reference</em> field</li>
                <li>Enter amount: <strong>${Number(totalAmount).toFixed(2)}</strong></li>
                <li>Pay via Razorpay, UPI, or Net Banking</li>
              </ol>
            </div>
            <div className="w-full space-y-3">
              <a
                href="https://absoluteveritas.com/online_payment.php"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Proceed to Payment <ExternalLink size={18} />
              </a>
              <button
                onClick={() => setStage('upload')}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                I've completed payment <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Bank transfer details */}
        {paymentMethod === 'bank_transfer' && (
          <>
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Details</p>
              {BANK_DETAILS.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{label}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStage('upload')}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              I've transferred the payment <ArrowRight size={18} />
            </button>
          </>
        )}

        <p className="text-xs text-slate-400 font-medium">
          Questions? Contact <span className="text-indigo-500">finance@absoluteveritas.com</span>
        </p>
      </div>
    );
  }

  // ─── Stage: upload ────────────────────────────────────────────────────────
  if (stage === 'upload') {
    const isRequired = paymentMethod === 'bank_transfer';
    return (
      <div className="flex flex-col items-center min-h-[60vh] py-16 space-y-8 max-w-xl mx-auto text-center">
        {/* Back */}
        <button
          onClick={() => { setReceiptFile(null); setUploadError(''); setStage('details'); }}
          className="self-start flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRequired ? 'Upload Bank Transfer Receipt' : 'Upload Payment Receipt'}
          </h2>
          {!isRequired && (
            <p className="text-slate-500 font-medium">
              Optional but recommended — helps us confirm your payment faster.
            </p>
          )}
        </div>

        <div className="w-full">
          <input
            type="file"
            id="receipt-upload-input"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="receipt-upload-input"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all"
          >
            <Upload size={24} className="text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {receiptFile ? receiptFile.name : 'Click to select file'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG — max 10 MB</p>
          </label>
        </div>

        {uploadError && (
          <p className="text-rose-600 text-sm font-bold">{uploadError}</p>
        )}

        <div className="w-full space-y-3">
          <button
            onClick={handleUploadAndFinish}
            disabled={isUploading || !receiptFile}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} /> Upload &amp; Finish
              </>
            )}
          </button>

          {!isRequired && (
            <button
              onClick={handleSkipAndFinish}
              disabled={isUploading}
              className="text-sm text-slate-400 hover:text-slate-600 font-bold transition-colors disabled:opacity-50"
            >
              Skip &amp; Finish
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStep;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/steps/PaymentStep.jsx
git commit -m "feat: redesign PaymentStep with method selection, bank details, and receipt upload"
```

---

## Manual Verification Checklist

After all tasks are complete, verify end-to-end with the dev server running (`cd frontend && npm run dev` + `cd backend && npm start`):

**Razorpay path:**
1. Complete a booking wizard through to PaymentStep
2. Method selection screen appears — click "Pay Online"
3. Booking summary + amber instructions card shown
4. Click "Proceed to Payment" — external URL opens in new tab
5. Click "I've completed payment" — upload screen appears with "optional" label and Skip link
6. Upload a JPG/PNG/PDF under 10 MB — "Upload & Finish" becomes enabled
7. Click "Upload & Finish" — redirected to `/dashboard/bookings`
8. In backend logs: confirm `POST /api/payments/bank-receipt` 200, two email sends logged (admin + client)
9. Check that booking in DB has `payment.method = 'razorpay'`, `payment.receiptFile` set
10. "Skip & Finish" path: click Skip instead — booking should have `payment.method = 'razorpay'`, no `receiptFile`

**Bank transfer path:**
1. Method selection — click "Bank Transfer"
2. Booking summary + bank details card shown (HDFC, 50200037111753, etc.)
3. Click "I've transferred the payment" — upload screen shown with no Skip link
4. "Upload & Finish" disabled until file selected
5. Select a file — button becomes enabled
6. Click "Upload & Finish" — redirected to `/dashboard/bookings`
7. Booking in DB: `payment.method = 'bank_transfer'`, `payment.receiptFile` set

**Email:**
- Admin at `cs@absoluteveritas.com` receives email with booking details + receipt attachment
- Client receives email with booking details, no attachment
