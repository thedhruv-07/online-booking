# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Commands

All commands run from `frontend/`:

```bash
cd frontend
npm run dev        # Start dev server on port 5174
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

Backend runs from `backend/`:

```bash
cd backend
npm install
npm start          # Express server on port 3001
```

Environment setup:
- Copy `frontend/.env.example` → `frontend/.env`, set `VITE_API_URL` (default: `http://localhost:3001/api`)
- Copy `backend/.env.example` → `backend/.env`, set `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_EMAIL` (set to `cs@absoluteveritas.com`)

There are no tests in this project.

---

## Product Spec — 10-Step Booking Flow

This platform replicates the booking flow for absoluteveritas.com. Every feature must map to one of these steps:

| Step | Name | Key Data Collected |
|------|------|--------------------|
| 1 | Sign Up | name, email, password |
| 2 | Account Activation | email verification token |
| 3 | Service Selection | inspection type (pre-shipment / DPI / CLS) |
| 4 | Inspection Dashboard | country, city, pricing display |
| 5 | Product Details | product name, description, unit type (set/pieces) |
| 6 | Documents + Date | PDF upload, inspectionDate |
| 7 | Factory + Contact | factory details, contact person |
| 8 | AQL Calculation | inspection level (I/II/III), minor/major AQL limits → computed sampleSize, acceptPoint, rejectPoint |
| 9 | Booking Overview | review all data, generated bookingId |
| 10 | Payment | Razorpay (redirect) or bank transfer + receipt PDF upload |

**The wizard in this repo covers Steps 3–10 as a 9-step wizard at `/booking/create`.**

---

## Architecture Overview

**React 19 + Vite** frontend SPA. Backend is Node/Express + MongoDB (Mongoose) on port 3001.

### Repository Layout

```
/
├── frontend/
│   └── src/
│       ├── store/          # React Context + useReducer (authStore, bookingStore)
│       │                   # uiStore.js is the only Zustand store (sidebar state)
│       ├── services/       # Axios API calls (auth, booking, payment, upload)
│       ├── components/
│       │   ├── steps/      # One component per booking wizard step
│       │   ├── booking/
│       │   ├── dashboard/
│       │   ├── layout/
│       │   └── ui/         # Hand-built primitives: Button, Input, Select, Modal, etc.
│       ├── pages/          # Route-level components (auth/, booking/, dashboard/, admin/)
│       ├── routes/         # AppRoutes.jsx + ProtectedRoute.jsx
│       ├── hooks/          # useAuth.js, useBooking.js (thin wrappers over Context)
│       └── utils/
│           └── aql/        # ISO 2859-1 AQL sampling plan (aqlService.js, codeLetterTable.js, samplingPlanTable.js)
├── backend/
│   ├── models/             # Mongoose schemas (Booking.js, User.js, ...)
│   ├── routes/             # Express route handlers
│   ├── middleware/         # JWT auth middleware
│   └── services/           # Email (Nodemailer), file upload (Multer), etc.
└── shared/
    └── pricing.js          # Single source of truth: services, pricing, COVERED_COUNTRIES
```

---

## State Management

- `authStore.jsx` and `bookingStore.jsx` → React Context + `useReducer`. Do NOT use Zustand for these.
- `uiStore.js` → Zustand only (sidebar collapse state).
- `BookingProvider` auto-saves wizard state to `localStorage` key `bookingDraft` with 1s debounce. Rehydrates on mount.
- Step data lives at `bookingData[step.route]` (e.g. `bookingData.aql`, `bookingData.service`).
- Steps call `updateStepData(route, data)` then `nextStep()` to advance.

---

## Booking Data Model — `backend/models/Booking.js`

**IMPORTANT:** The schema uses typed sub-schemas (no `Mixed` blobs, no `strict: false`). Key fields:

```js
{
  userId:         ObjectId → ref 'User'         // required
  service: {
    selected:     [String]                       // e.g. ['pre-shipment']
    country:      String
    region:       String
    basePrice:    Number
    discount:     Number (default 0)
    totalAmount:  Number
    currency:     String (default 'USD')
  }
  inspectionDate: Date                           // required — Step 6
  product: {
    name:         String
    description:  String
    unitType:     'set' | 'pieces'
    quantity:     Number
  }
  bookingFiles: [{                               // PDF uploads — Step 6
    filename, url, mimetype, uploadedAt
  }]
  factory: {
    name, address, city, country, postalCode
  }
  contact: {
    name, email, phone, countryCode, position
  }
  aql: {
    inspectionLevel:  'I' | 'II' | 'III'
    minorDefectLimit: Number
    majorDefectLimit: Number
    sampleSize:       Number                     // computed
    acceptPoint:      Number                     // computed
    rejectPoint:      Number                     // computed
  }
  payment: {
    status:        'pending' | 'paid' | 'failed' | 'refunded'
    method:        'razorpay' | 'paypal' | 'bank_transfer' | null
    receiptFile:   { filename, url, mimetype, uploadedAt }  // bank transfer only
    paidAt:        Date
  }
  status: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  quoteBreakdown: Mixed
  timestamps: true
}
```

Collection name: `bookingfinalv1`

---

## Pricing Logic

All pricing lives in `shared/pricing.js` (pure ESM). Imported in frontend via `@shared` Vite alias (resolves to `../shared`).

- **Do NOT** duplicate pricing constants in frontend or backend — always import from `@shared/pricing`.
- `COVERED_COUNTRIES`: ISO-2 codes with lower pricing (268 USD vs 368 USD).
- `calculateFinalPrice(selectedIds, countryCode)` handles bundle discounts.

---

## API Layer (Frontend)

`src/services/api.js` — configured Axios instance:
- Injects JWT from `localStorage.token` on every request
- Auto-logout + redirect to `/login` on 401
- Response interceptor unwraps `.data` so callers get payload directly
- Pass `{ showToast: false }` in Axios config to suppress automatic error toasts

Services: `auth.service.js`, `booking.service.js`, `payment.service.js`, `upload.service.js`

---

## Routing & Auth

- `ProtectedRoute` checks `isAuthenticated` from `authStore`
- Role-based: pass `roles={['admin']}` to `ProtectedRoute`
- All admin routes under `/admin/*`

---

## AQL Calculation

`src/utils/aql/aqlService.js` implements ISO 2859-1 / ANSI ASQ Z1.4:
- Input: `{ lotSize, level, majorAQL, minorAQL }`
- Level string matches table keys: `"I"`, `"II"`, `"III"`, `"S-1"` … `"S-4"`
- Output: `{ sampleSize, acceptPoint, rejectPoint }` — store all three on the `aql` sub-document in MongoDB

---

## Payment (Step 10)

Two methods — no Razorpay SDK. Payment confirmation is manual at this stage.

PaymentStep is a 3-stage flow: **method selection → payment details → receipt upload / confirmation.**

**Method 1 — Razorpay (online):**
- User selects "Pay Online (Card / UPI / Net Banking)"
- App shows a reference card (Invoice No = booking `_id`, Amount, Email, Purpose)
- "Proceed to Payment" opens `https://absoluteveritas.com/online_payment.php` in a new tab
- After proceeding, user clicks "I've completed payment" → PATCH booking with `{ payment: { method: 'razorpay', status: 'pending' } }` → navigate to `/dashboard/bookings`
- Status stays `'pending'` until admin confirms manually

**Method 2 — Bank Transfer:**
- User selects "Bank Transfer"
- App shows hardcoded bank details:
  - Beneficiary: Absolute Veritas | Account: 50200037111753 | IFSC: HDFC0000093
  - Bank: HDFC Bank | SWIFT: HDFCINBB | Branch: HDFC Bank, NIT-5 Faridabad
- User uploads receipt PDF → `POST /payments/bank-receipt` (multipart: `bookingId` + `receipt` file)
- Backend sets `payment.receiptFile`, `payment.method = 'bank_transfer'`, `payment.status = 'pending'`
- On upload, backend sends **two emails**:
  1. Admin (`ADMIN_EMAIL` = `cs@absoluteveritas.com`) — receipt attached
  2. Client — confirmation email without attachment
- Booking `status` stays `'pending'` — admin reviews and confirms manually
- Frontend shows success state with "View My Bookings" button

**DB write timing:** Method selection is local state only. DB write happens on the confirm action ("I've completed payment" or receipt upload), not on card selection.

---

## Styling

- Tailwind CSS + `clsx` + `tailwind-merge` via `src/utils/cn.js`
- No external component library — all UI primitives hand-built in `src/components/ui/`
- Framer Motion for step transition animations

---

## Inspection Report Integration (IRMS — Live)

This booking system is integrated with the **Inspection Report Management System (IRMS)** at https://github.com/thedhruv-07/report-app.

**Integration key:** `bookingId` (`_id` from the Booking document)

**Live endpoint:** `GET /api/bookings/:id/report-data` — returns the payload the IRMS consumes:
```js
{
  bookingId,
  inspectionDate,
  service.selected,       // inspection type
  product,                // name, description, unitType, quantity
  factory,                // name, address, city, country
  contact,                // name, email, phone
  aql,                    // level, limits, sampleSize, acceptPoint, rejectPoint
}
```

**Do not** couple the two repos via shared DB — use the HTTP API as the boundary.

---

## Known Issues / TODO

- [ ] File uploads need URL storage (S3/Cloudinary) — `bookingFiles[].url` and `payment.receiptFile.url` must be real URLs, not local paths

## Completed Features

- **PaymentStep redesign (2026-05-26):** 3-stage flow — method selection → payment details → receipt upload/confirmation. `POST /payments/bank-receipt` endpoint live. On bank transfer receipt upload, two emails are sent: admin (`cs@absoluteveritas.com`) receives the receipt as an attachment, client receives a confirmation email. `payment.method` enum includes `'razorpay' | 'paypal' | 'bank_transfer'`.