# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `frontend/`:

```bash
cd frontend
npm run dev        # Start dev server on port 5174
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

Environment: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` (defaults to `http://localhost:3001/api`).

There are no tests in this project.

## Architecture Overview

This is a **React 19 + Vite** frontend-only SPA for a product inspection booking platform. The backend API is external (Node/Express on port 3001).

### Repository Layout

```
/
├── frontend/          # React app (the only app in this repo)
│   └── src/
│       ├── store/     # React Context-based state (NOT Zustand for auth/booking)
│       ├── services/  # Axios API calls
│       ├── components/
│       │   ├── steps/ # Each step of the booking wizard
│       │   ├── booking/
│       │   ├── dashboard/
│       │   ├── layout/
│       │   └── ui/    # Reusable primitives (Button, Input, Select, Modal, etc.)
│       ├── pages/     # Route-level components (auth/, booking/, dashboard/, admin/)
│       ├── routes/    # AppRoutes.jsx + ProtectedRoute.jsx
│       ├── hooks/     # useAuth.js, useBooking.js (thin wrappers over Context)
│       └── utils/
│           └── aql/   # ISO 2859-1 AQL sampling plan calculation
└── shared/
    └── pricing.js     # Single source of truth for services, pricing, COVERED_COUNTRIES
```

### State Management — Two Patterns

**`authStore.jsx`** and **`bookingStore.jsx`** use React Context + `useReducer` (not Zustand). The `uiStore.js` (sidebar collapse) is the only Zustand store.

`BookingProvider` auto-saves draft state to `localStorage` (`bookingDraft`) with a 1s debounce and rehydrates on mount.

### Multi-Step Booking Wizard

The booking flow (`/booking/create`) is a 9-step wizard managed entirely by `BookingProvider`:

1. Service → 2. Location → 3. Product → 4. Upload → 5. Factory → 6. Contact → 7. AQL → 8. Overview → 9. Payment

Each step is a component in `src/components/steps/`. Step data is stored in `bookingData[step.route]` (e.g. `bookingData.aql`, `bookingData.service`). Steps call `updateStepData(route, data)` then `nextStep()`.

### Pricing Logic

All pricing lives in `shared/pricing.js` (pure ESM, imported by both the frontend via `@shared` Vite alias and any future backend). The `@shared` alias resolves to `../shared` relative to `frontend/`. Do **not** duplicate pricing constants in the frontend — always import from `@shared/pricing`.

`COVERED_COUNTRIES` is a list of ISO-2-letter country codes with lower pricing (268 USD vs 368 USD). `calculateFinalPrice(selectedIds, countryCode)` handles bundle discounts.

### API Layer

`src/services/api.js` is a configured Axios instance with:
- Auth token injected from `localStorage.token` on every request
- Auto-logout + redirect to `/login` on 401
- Response interceptor unwraps `.data` so service calls return the payload directly

Services (`auth.service.js`, `booking.service.js`, `payment.service.js`, `upload.service.js`) all use this shared instance. Pass `{ showToast: false }` in Axios config to suppress automatic error toasts.

### Routing & Auth

`ProtectedRoute` checks `isAuthenticated` from `authStore`. Role-based protection passes `roles={['admin']}` to `ProtectedRoute`. All admin routes are under `/admin/*`.

### AQL Calculation

`src/utils/aql/aqlService.js` implements ISO 2859-1 sampling plan lookup using two static lookup tables (`codeLetterTable.js`, `samplingPlanTable.js`). Input: `{ lotSize, level, majorAQL, minorAQL }`. The level string matches the table keys (e.g. `"I"`, `"II"`, `"S-2"`).

### Styling

Tailwind CSS with `clsx` + `tailwind-merge` via `src/utils/cn.js`. No component library — all UI primitives are hand-built in `src/components/ui/`. Framer Motion is used for animations in booking steps.
