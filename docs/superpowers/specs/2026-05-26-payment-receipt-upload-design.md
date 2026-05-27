
# Payment Receipt Upload — Design Spec
Date: 2026-05-26

## Summary

Add receipt upload to the PaymentStep wizard for both payment methods (Razorpay and bank transfer), and send admin + client notification emails when a receipt is uploaded. The PaymentStep is restructured to support two explicit payment paths matching the product spec in CLAUDE.md.

---

## Frontend: PaymentStep Redesign

### State

```js
paymentMethod: null | 'razorpay' | 'bank_transfer'
stage: 'select' | 'details' | 'upload' | 'done'
receiptFile: File | null
isUploading: boolean
uploadError: string
```

### Stage: select

Two clickable method cards:
- "Pay Online (Razorpay / UPI / Net Banking)"
- "Bank Transfer"

Clicking either sets `paymentMethod` and advances to `details`.

### Stage: details (razorpay)

- Booking summary card (current design, unchanged)
- Payment instructions (current amber box, unchanged)
- "Proceed to Payment" link → opens `https://absoluteveritas.com/online_payment.php` in new tab
- "I've completed payment" button → advances to `upload`

### Stage: details (bank_transfer)

- Booking summary card
- Bank details card (hardcoded):
  - Beneficiary: Absolute Veritas
  - Account: 50200037111753
  - IFSC: HDFC0000093
  - Bank: HDFC Bank
  - SWIFT: HDFCINBB
  - Branch: HDFC Bank, NIT-5 Faridabad
- "I've transferred the payment" button → advances to `upload`

### Stage: upload (razorpay)

- Heading: "Upload Payment Receipt (optional but recommended)"
- File input: accepts PDF, JPG, PNG; max 10 MB
- "Upload & Finish" primary button
- "Skip & Finish" text link below

On "Upload & Finish":
1. Call `paymentService.uploadBankReceipt(bookingId, file)` with extra `method: 'razorpay'` param
2. PATCH booking: `{ payment: { method: 'razorpay', status: 'pending' } }`
3. `clearDraft()` + navigate to `/dashboard/bookings`

On "Skip & Finish":
1. PATCH booking: `{ payment: { method: 'razorpay', status: 'pending' } }`
2. `clearDraft()` + navigate to `/dashboard/bookings`

### Stage: upload (bank_transfer)

- Heading: "Upload Bank Transfer Receipt"
- Same file input (PDF/JPG/PNG, max 10 MB)
- "Upload & Finish" button — **disabled until file is chosen** (required)
- No Skip link

On "Upload & Finish":
1. Call `paymentService.uploadBankReceipt(bookingId, file)` with `method: 'bank_transfer'`
2. `clearDraft()` + navigate to `/dashboard/bookings`
   (backend sets payment.method and payment.status='pending' in the handler)

### uploadBankReceipt service update

Add optional `method` parameter and include it in the FormData:

```js
uploadBankReceipt: async (bookingId, file, method = 'bank_transfer') => {
  const formData = new FormData();
  formData.append('bookingId', bookingId);
  formData.append('receipt', file);
  formData.append('method', method);
  return api.uploadFile('/payments/bank-receipt', formData);
}
```

---

## Backend

### New route: `POST /payments/bank-receipt`

In `backend/routes/payments.js`, add **before** the `/:id` parameterized routes:

```js
router.post('/bank-receipt', upload.single('receipt'), handleMulterError, paymentController.uploadBankReceipt);
```

### New controller: `uploadBankReceipt`

In `backend/controllers/paymentController.js`:

```
1. Extract bookingId, method from req.body (default method: 'bank_transfer')
2. Find booking by { _id: bookingId, userId: req.user._id } — populate userId for email
3. If not found → 404
4. Build receiptFile object from req.file: { filename, url: '/uploads/' + filename, mimetype, uploadedAt: new Date() }
5. Update booking:
   - payment.receiptFile = receiptFile
   - payment.method = method
   - payment.status = 'pending' (unchanged, admin confirms manually)
6. Call sendBookingReceiptEmail({ user: req.user, booking, receiptPath: req.file.path })
7. Return { success: true }
```

Note: `payment.status` stays `'pending'` — no status promotion happens on receipt upload. Admin reviews and confirms manually.

### New email function: `sendBookingReceiptEmail`

In `backend/utils/sendEmail.js`:

**Admin email:**
- To: `process.env.ADMIN_EMAIL` (skip silently if not set)
- Subject: `New Booking Payment Received — Booking #[bookingId.slice(-8).toUpperCase()]`
- Body: client name, email, inspection type, inspection date, factory name, amount, payment method
- Attachment: `req.file.path` (the uploaded receipt file)

**Client email:**
- To: booking's user email (populate `userId` on the booking query)
- Subject: `Payment Receipt Received — Booking #[bookingId.slice(-8).toUpperCase()]`
- Body:
  ```
  Dear [client name],

  We have received your payment receipt for your inspection booking.
  Our team will verify your payment and confirm your booking within
  1–2 business days.

  Booking Details:
  - Booking ID: [full bookingId]
  - Inspection Type: [service.selected joined]
  - Inspection Date: [formatted inspectionDate]
  - Amount: [service.totalAmount] [service.currency]

  If you have any questions, contact us at cs@absoluteveritas.com
  ```
- No attachment

### `backend/.env.example`

Add line: `ADMIN_EMAIL=`

### `backend/.env`

Add line: `ADMIN_EMAIL=cs@absoluteveritas.com`

---

## What does NOT change

- `sendBookingEmail` (existing function) — fires on admin-confirmed payments, untouched
- MyBookings bank transfer upload modal — kept as-is (fallback for users who skip upload in wizard)
- All other PaymentStep data (bookingId, totalAmount, serviceName) sourced from `bookingData.payment` / `bookingData.service` — no change

---

## Constraints

- Receipt file stored at `/uploads/<filename>` (local disk, same as other file uploads in this project)
- No S3/Cloudinary yet (tracked as known TODO in CLAUDE.md)
- Admin email attachment uses local file path — works because admin email is sent synchronously before the response
