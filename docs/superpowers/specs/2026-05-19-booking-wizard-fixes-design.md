# Booking Wizard Fixes — Design Spec
**Date:** 2026-05-19  
**Scope:** Frontend only (React app in `frontend/src/`). Backend endpoints for factory/contact persistence and bank-receipt upload are assumed to exist; this spec covers the frontend service layer and UI against those endpoints.

---

## 1. Payment Step → Redirect (Critical)

### Problem
`PaymentStep.jsx` is a full inline payment form (card, PayPal, bank transfer inputs). The spec requires no inline payment processing — instead the user is redirected to the existing payment page at `https://absoluteveritas.com/online_payment.php`.

### Solution
Replace `PaymentStep.jsx` content entirely. The step becomes a read-only **Booking Confirmation** screen.

**Flow:**
1. User completes step 8 (Overview) and clicks **"Submit Booking Request"**
2. `OverviewStep` calls `submitBooking()`, shows a loading spinner on the button
3. On success: calls `nextStep()` to advance to step 9
4. Step 9 renders the new confirmation screen — no forms, no payment inputs

**Confirmation screen contents:**
- Large success icon (emerald checkmark)
- Auto-generated Booking ID (from the backend response `booking._id`, formatted as `#XXXXXXXX`)
- Service name and total amount (USD, from `bookingData.service`)
- Instruction text: "To complete your booking, proceed to payment. Use your Booking ID as the Invoice Reference on the payment form."
- **"Proceed to Payment"** button → `window.open('https://absoluteveritas.com/online_payment.php', '_blank')`
- **"View My Bookings"** secondary button → navigates to `/dashboard/bookings`, clears draft

### Changes
- `OverviewStep.jsx`: move `submitBooking()` call here, rename button, add loading state
- `PaymentStep.jsx`: full rewrite — remove all payment forms, render confirmation screen only
- `bookingStore.jsx`: no changes needed (submitBooking already exists)

---

## 2. Overview Step — "Submit Booking Request"

### Changes to `OverviewStep.jsx`
- Add local state: `isSubmitting` (boolean), `submitError` (string|null)
- Button label: "Submit Booking Request" (replaces "Confirm & Proceed")
- On click:
  ```
  setIsSubmitting(true)
  const result = await submitBooking()
  if (result.success) nextStep()
  else setSubmitError(result.error)
  setIsSubmitting(false)
  ```
- Show inline error banner if `submitError` is set
- Button disabled + spinner while `isSubmitting`

---

## 3. Upload Step — PDF Only

### Changes to `UploadStep.jsx`
- Change `accept` prop on `FileUpload` from `".pdf,.doc,.docx,.jpg,.jpeg,.png"` to `".pdf"`
- Update helper text to "PDF documents only (max 10MB)"
- Add a note: "Please upload your product specification or inspection checklist as a PDF."
- Remove the generic styled wrapper (currently uses unstyled `.card` class) — replace with the same white card + icon header pattern used by other steps

---

## 4. Factory Step — Dropdown + Add New

### New service: `frontend/src/services/factory.service.js`
```
GET  /user/factories          → list user's saved factories
POST /user/factories          → create and save a new factory
```
Response shape for a factory:
```json
{ "_id": "...", "name": "...", "location": "...", "phone": "..." }
```

### UI Changes to `FactoryStep.jsx`
**Two states:**

**State A — Select from saved:**
- Searchable dropdown (reuse `SearchableSelect`) listing saved factories
- Last option in the list: `+ Add New Factory` (visually distinct, indigo color)
- If user selects an existing factory: populate read-only summary card below, enable Continue
- If user selects "Add New Factory": switch to State B

**State B — Inline add form:**
- Slides in below the dropdown (AnimatePresence/motion.div)
- Fields: Factory Name, Contact Number (with phone prefix select), Full Address (textarea)
- **"Save Factory"** button: calls `POST /user/factories`, on success refreshes dropdown and auto-selects the new entry, returns to State A
- **"Cancel"** link: returns to State A without saving

**On mount:**
- `useEffect` calls `factoryService.getFactories()`, stores in local state `savedFactories`
- If `bookingData.factory` is already set, pre-select that factory in the dropdown

---

## 5. Contact Step — Dropdown + Add New

### New service: `frontend/src/services/contact.service.js`
```
GET  /user/contacts           → list user's saved contacts
POST /user/contacts           → create and save a new contact
```
Response shape:
```json
{ "_id": "...", "name": "...", "email": "...", "phone": "...", "designation": "..." }
```

### UI Changes to `ContactStep.jsx`
Identical pattern to Factory step:
- Dropdown of saved contacts + "Add New Contact" option
- Inline form with: Name, Email, Phone (with prefix), Designation
- "Save Contact" → POST, refresh, auto-select
- Retain the "Use my profile details" toggle — it populates the inline add form fields

---

## 6. Location Step — Pricing Popup

### When triggered
After user selects a **country** (not city), a modal opens automatically.

### Modal contents
- Title: "Service Pricing for [Country Name]"
- Region badge: "Covered Region" (green) or "Standard Region" (gray)
- For each selected service in `bookingData.service.selected`, show: service name + price
- If no services selected yet: show a note "Return to step 1 to select services first" and only show Continue
- Total line
- **"Continue with this pricing"** button → closes modal, nothing else changes
- Modal is informational only — does not block progress

### Implementation
- Local state `showPricingModal` in `LocationStep.jsx`
- `useEffect` watches `formData.country` — when it changes to a non-empty value, `setShowPricingModal(true)`
- Use existing `Modal` component from `components/ui/Modal`
- Pricing data from `@shared/pricing` (`calculateFinalPrice`, `COVERED_COUNTRIES`, `services`)

---

## 7. Bank Transfer Confirm in My Bookings

### When shown
In `MyBookings.jsx`, for each booking row where:
- `booking.payment?.method === 'bank_transfer'`  
- `booking.status === 'pending'` (awaiting receipt upload)

Show an additional **"Confirm Payment"** button (amber color) in the Action column, alongside the existing eye/menu icons.

### Modal flow
1. Click "Confirm Payment" → opens `ConfirmPaymentModal`
2. Modal shows: booking ID, amount, instruction text
3. PDF-only file upload (single file, max 10MB)
4. **"Upload Receipt"** button → calls `POST /payments/bank-receipt` with `{ bookingId, receiptFile }`
5. On success: close modal, refresh bookings list, show toast "Receipt uploaded — awaiting admin confirmation"
6. Booking row status badge changes to "Awaiting Confirmation" (new status style: purple)

### New service method in `payment.service.js`
```
POST /payments/bank-receipt   → FormData: { bookingId, receipt (PDF file) }
```

---

## 8. Auth Navbar — "Create Account" Button

### New component: `frontend/src/components/layout/AuthNavbar.jsx`
- Fixed top bar, height 64px, white background, border-bottom
- Left: Absolute Veritas logo text + ShieldCheck icon (matching the Login page icon style)
- Right: "Create Account" button → Link to `/signup` (indigo, rounded, same style as existing buttons)
  - When on `/signup` page, button changes to "Sign In" → Link to `/login`

### Integration
- Wrap `Login.jsx` and `Signup.jsx` in a `<div>` with `<AuthNavbar />` above the existing content
- Remove the manual top-padding on the auth pages' outer div (currently `py-12`) — the navbar provides top offset

---

## Backend Endpoints Required (not in this repo)

The following endpoints must exist on the backend before the factory/contact/bank-receipt features work. The frontend will show a graceful empty state if they return 404.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/user/factories` | List user's saved factories |
| POST | `/user/factories` | Save a new factory |
| GET | `/user/contacts` | List user's saved contacts |
| POST | `/user/contacts` | Save a new contact |
| POST | `/payments/bank-receipt` | Upload bank transfer receipt PDF |

---

## Files Changed

| File | Change type |
|------|-------------|
| `components/steps/PaymentStep.jsx` | Full rewrite |
| `components/steps/OverviewStep.jsx` | Add submit logic + button rename |
| `components/steps/UploadStep.jsx` | PDF-only + UI polish |
| `components/steps/FactoryStep.jsx` | Full rewrite with dropdown pattern |
| `components/steps/ContactStep.jsx` | Full rewrite with dropdown pattern |
| `components/steps/LocationStep.jsx` | Add pricing modal |
| `pages/dashboard/MyBookings.jsx` | Add Confirm Payment button + modal |
| `components/layout/AuthNavbar.jsx` | New file |
| `pages/auth/Login.jsx` | Add AuthNavbar |
| `pages/auth/Signup.jsx` | Add AuthNavbar |
| `services/factory.service.js` | New file |
| `services/contact.service.js` | New file |
| `services/payment.service.js` | Add `uploadBankReceipt` method |
