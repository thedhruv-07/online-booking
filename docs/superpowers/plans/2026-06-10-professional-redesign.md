# Professional UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all vibe-coded patterns with a consistent Structured Professional design — 8px radius, no gradient blobs, always-expanded sidebar, clean page header, left-border stat cards.

**Architecture:** Tailwind token change cascades radius/shadow fixes to most components automatically. Manual edits cover hardcoded `rounded-[x]` values and structural rewrites (Sidebar, WelcomeBanner, StatsCard). No backend changes.

**Tech Stack:** React 19, Tailwind CSS, Framer Motion (kept for step transitions), lucide-react icons, Vite dev server (`cd frontend && npm run dev`)

---

## File Map

| File | Change |
|---|---|
| `frontend/tailwind.config.js` | `av` radius 16px→8px, shadow values |
| `frontend/src/index.css` | btn/input/card/label/badge CSS classes, remove `.text-gradient` |
| `frontend/src/store/uiStore.js` | Delete — collapse state no longer needed |
| `frontend/src/components/layout/Sidebar.jsx` | Full rewrite — always-expanded, nav sections, user row pinned to bottom |
| `frontend/src/components/layout/MainLayout.jsx` | Remove collapse logic, fixed `pl-[232px]` |
| `frontend/src/components/dashboard/WelcomeBanner.jsx` | Delete |
| `frontend/src/pages/dashboard/Dashboard.jsx` | Replace WelcomeHeader with inline PageHeader |
| `frontend/src/components/dashboard/StatsCard.jsx` | Rewrite — remove icon circles, add left-border accent |
| `frontend/src/components/dashboard/RecentBookingsTable.jsx` | `rounded-[16px]` → `rounded-lg` on container (2 instances) |
| `frontend/src/components/dashboard/QuickActions.jsx` | `rounded-[16px]` → `rounded-lg`, `rounded-xl` → `rounded-lg` |
| `frontend/src/components/booking/BookingLayout.jsx` | Remove blob divs, fix radii on card/info-card |
| `frontend/src/components/booking/Stepper.jsx` | `rounded-full` → `rounded-lg` on step pills |
| `frontend/src/pages/auth/Login.jsx` | Remove blob divs, `rounded-3xl` → `rounded-xl` on card |
| `frontend/src/pages/auth/Signup.jsx` | Remove blob divs, `rounded-3xl` → `rounded-xl` on card(s) |

---

## Task 1: Design Tokens — Tailwind Config + Global CSS

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`

- [ ] **Step 1.1 — Update tailwind.config.js**

Replace the entire file with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        av: {
          orange: '#F58220',
          'orange-hover': '#E56D00',
          'orange-light': '#FFF4EA',
          navy: '#0B3A70',
          'navy-hover': '#092E5A',
          'light-blue': '#EAF1F8',
          background: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          'text-dark': '#1E293B',
          'text-light': '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'av': '8px',
      },
      boxShadow: {
        'av-card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'av-hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 1.2 — Update index.css**

Replace the entire file with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
    font-family: 'Inter', 'Poppins', system-ui, -apple-system, sans-serif;
  }
  body {
    @apply bg-av-background text-av-text-dark antialiased;
  }
}

@layer components {
  /* ─── Buttons ─── */
  .btn-primary {
    @apply bg-av-orange hover:bg-av-orange-hover text-white font-semibold py-3 px-8 rounded-av transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-av-orange/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:brightness-105;
  }

  .btn-secondary {
    @apply bg-white hover:bg-slate-50 text-av-navy font-semibold py-3 px-8 rounded-av border border-slate-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-av-navy/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm;
  }

  .btn-danger {
    @apply bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-3 px-8 rounded-av border border-rose-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 text-sm;
  }

  .btn-success {
    @apply bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-av transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-sm;
  }

  /* ─── Inputs ─── */
  .input-field {
    @apply w-full px-4 py-3 border border-av-border rounded-av bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-av-orange/10 focus:border-av-orange/50 transition-all duration-200 placeholder:text-av-text-light font-medium text-sm;
  }

  .input-error {
    @apply border-rose-500 focus:ring-rose-500/10;
  }

  /* ─── Labels ─── */
  .label {
    @apply block text-xs font-semibold text-slate-500 mb-1.5;
  }

  /* ─── Cards ─── */
  .card {
    @apply bg-white rounded-av shadow-av-card p-6 border border-av-border;
  }

  .card-hover {
    @apply bg-white rounded-av shadow-av-card p-6 border border-av-border hover:shadow-av-hover transition-shadow duration-200;
  }

  /* ─── Status Badges ─── */
  .badge-scheduled {
    @apply inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold;
    background: #FFF4EA;
    color: #c96b00;
  }

  .badge-in-progress {
    @apply inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold;
    background: #FEF3C7;
    color: #D97706;
  }

  .badge-completed {
    @apply inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold;
    background: #DCFCE7;
    color: #16A34A;
  }

  .badge-cancelled {
    @apply inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold;
    background: #FEE2E2;
    color: #DC2626;
  }

  .badge-confirmed {
    @apply inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold;
    background: #EAF1F8;
    color: #0B3A70;
  }

  /* ─── Service Type Badges ─── */
  .badge-service {
    @apply inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide;
    background: #EAF1F8;
    color: #0B3A70;
  }
}

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 rounded-full hover:bg-slate-300 transition-colors;
  }
}
```

- [ ] **Step 1.3 — Run lint to verify no errors**

```
cd frontend && npm run lint
```

Expected: no errors (warnings OK)

- [ ] **Step 1.4 — Commit**

```
git add frontend/tailwind.config.js frontend/src/index.css
git commit -m "style: update design tokens — 8px radius, tighter shadows, clean CSS classes"
```

---

## Task 2: Sidebar Rewrite + Remove Collapse State

**Files:**
- Rewrite: `frontend/src/components/layout/Sidebar.jsx`
- Delete: `frontend/src/store/uiStore.js`
- Modify: `frontend/src/components/layout/MainLayout.jsx`

- [ ] **Step 2.1 — Rewrite Sidebar.jsx**

Replace entire file:

```jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  CreditCard,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/authStore.jsx';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: ClipboardList, label: 'My Bookings', to: '/dashboard/bookings' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { icon: PlusCircle, label: 'Create Booking', to: '/booking/create' },
      { icon: CreditCard, label: 'Payments', to: '/dashboard/payments' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: User, label: 'Profile', to: '/profile' },
      { icon: Settings, label: 'Settings', to: '/settings' },
    ],
  },
];

const SidebarLink = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    end={to === '/dashboard'}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 text-[13px] font-medium',
        isActive
          ? 'bg-orange-50 text-orange-700 font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      )
    }
  >
    <Icon size={16} strokeWidth={1.75} className="shrink-0" />
    {label}
  </NavLink>
);

const Sidebar = () => {
  const { logout, user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[232px] bg-white border-r border-slate-100 z-50 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center">
          <img
            src="/company-logo.png"
            alt="Absolute Veritas"
            className="h-9 object-contain max-w-[160px]"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-100 p-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-av-navy flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
        >
          <LogOut size={16} strokeWidth={1.75} className="shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
```

- [ ] **Step 2.2 — Update MainLayout.jsx**

Replace entire file:

```jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-av-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen pl-[232px]">
        <Navbar />

        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="py-4 px-8 text-center text-slate-400 text-xs border-t border-slate-100 bg-white">
          © Absolute Veritas Inspection Service | Support: info@av-inspec.com
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
```

- [ ] **Step 2.3 — Delete uiStore.js**

```
Remove-Item "frontend/src/store/uiStore.js"
```

- [ ] **Step 2.4 — Lint**

```
cd frontend && npm run lint
```

Expected: no errors (if there are errors about uiStore imports, they will be fixed by the rewrites above)

- [ ] **Step 2.5 — Commit**

```
git add frontend/src/components/layout/Sidebar.jsx frontend/src/components/layout/MainLayout.jsx
git rm frontend/src/store/uiStore.js
git commit -m "feat: always-expanded sidebar, remove collapse state, clean nav sections"
```

---

## Task 3: Replace WelcomeBanner with Clean Page Header

**Files:**
- Modify: `frontend/src/pages/dashboard/Dashboard.jsx`
- Delete: `frontend/src/components/dashboard/WelcomeBanner.jsx`

- [ ] **Step 3.1 — Rewrite Dashboard.jsx**

Replace entire file:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import StatsCards from '../../components/dashboard/StatsCard';
import BookingsTable from '../../components/dashboard/RecentBookingsTable';
import QuickActions from '../../components/dashboard/QuickActions';
import UpcomingBookings from '../../components/dashboard/UpcomingBookings';
import RecentActivity from '../../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { bookings, isLoading } = useBooking();

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">{today} · Absolute Veritas</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Bookings
          </Link>
          <Link
            to="/booking/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-av-orange rounded-lg hover:bg-av-orange-hover transition-colors"
          >
            + New Booking
          </Link>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Stats */}
      <StatsCards bookings={bookings || []} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <BookingsTable bookings={bookings || []} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-4 space-y-5">
          <QuickActions />
          <UpcomingBookings bookings={bookings || []} />
          <RecentActivity bookings={bookings || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 3.2 — Delete WelcomeBanner.jsx**

```
Remove-Item "frontend/src/components/dashboard/WelcomeBanner.jsx"
```

- [ ] **Step 3.3 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 3.4 — Commit**

```
git add frontend/src/pages/dashboard/Dashboard.jsx
git rm frontend/src/components/dashboard/WelcomeBanner.jsx
git commit -m "feat: replace hero banner with clean page header on dashboard"
```

---

## Task 4: Rewrite StatsCard — Left-Border Accents

**Files:**
- Modify: `frontend/src/components/dashboard/StatsCard.jsx`

- [ ] **Step 4.1 — Rewrite StatsCard.jsx**

Replace entire file:

```jsx
import React from 'react';

const ACCENT_COLORS = [
  'border-l-av-orange',
  'border-l-av-navy',
  'border-l-amber-400',
  'border-l-emerald-500',
  'border-l-violet-400',
  'border-l-rose-400',
];

const StatCard = ({ label, value, accentClass }) => (
  <div className={`bg-white border border-slate-100 rounded-lg p-4 border-l-[3px] shadow-av-card ${accentClass}`}>
    <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
    <p className="text-xs font-medium text-slate-400 mt-2">{label}</p>
  </div>
);

const StatsCards = ({ bookings = [] }) => {
  const totalBookings = bookings.length;

  const scheduledBookings = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status?.toLowerCase())
  ).length;

  const inProgressBookings = bookings.filter(b =>
    b.status?.toLowerCase() === 'in_progress'
  ).length;

  const completedBookings = bookings.filter(b =>
    b.status?.toLowerCase() === 'completed'
  ).length;

  const certificatesIssued = Math.floor(completedBookings * 0.8);

  const pendingPayments = bookings.filter(b =>
    b.paymentStatus?.toLowerCase() === 'pending'
  ).length;

  const stats = [
    { label: 'Total Bookings', value: totalBookings },
    { label: 'Scheduled Inspections', value: scheduledBookings },
    { label: 'In Progress', value: inProgressBookings },
    { label: 'Completed Reports', value: completedBookings },
    { label: 'Certificates Issued', value: certificatesIssued },
    { label: 'Pending Payments', value: pendingPayments },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} accentClass={ACCENT_COLORS[i]} />
      ))}
    </div>
  );
};

export default StatsCards;
```

- [ ] **Step 4.2 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 4.3 — Commit**

```
git add frontend/src/components/dashboard/StatsCard.jsx
git commit -m "style: replace icon-circle stat cards with left-border accent design"
```

---

## Task 5: Fix RecentBookingsTable Container Radius

**Files:**
- Modify: `frontend/src/components/dashboard/RecentBookingsTable.jsx`

- [ ] **Step 5.1 — Replace hardcoded rounded-[16px] on container**

There are two instances of `rounded-[16px]` in this file (loading state container and main container). Replace both:

Find `rounded-[16px]` (appears on lines 64 and 75) and change to `rounded-lg` in both places.

Also on line 64, change:
```
"bg-white rounded-[16px] border border-[#E2E8F0] p-12 shadow-av-card"
```
to:
```
"bg-white rounded-lg border border-slate-100 p-12 shadow-av-card"
```

And on line 75, change:
```
"bg-white rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-av-card"
```
to:
```
"bg-white rounded-lg border border-slate-100 overflow-hidden shadow-av-card"
```

- [ ] **Step 5.2 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 5.3 — Commit**

```
git add frontend/src/components/dashboard/RecentBookingsTable.jsx
git commit -m "style: fix table container radius and border color"
```

---

## Task 6: Fix QuickActions Radius

**Files:**
- Modify: `frontend/src/components/dashboard/QuickActions.jsx`

- [ ] **Step 6.1 — Fix radii in QuickActions.jsx**

On line 35, change:
```
"bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-av-card"
```
to:
```
"bg-white rounded-lg border border-slate-100 p-5 shadow-av-card"
```

On line 42, change:
```
"flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
```
to:
```
"flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
```

On line 44, change:
```
"w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
```
to:
```
"w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
```

- [ ] **Step 6.2 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 6.3 — Commit**

```
git add frontend/src/components/dashboard/QuickActions.jsx
git commit -m "style: fix QuickActions radius and spacing"
```

---

## Task 7: BookingLayout — Remove Blobs, Fix Radii

**Files:**
- Modify: `frontend/src/components/booking/BookingLayout.jsx`

- [ ] **Step 7.1 — Remove blob divs and fix all radii**

Replace entire file:

```jsx
import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/authStore';

const BookingLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-av-orange animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/booking/create' }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-av-orange font-semibold text-sm transition-colors mb-5 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Booking</h1>
            <p className="text-slate-400 mt-1.5 text-sm">Configure your inspection request step by step.</p>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-start gap-3 max-w-sm shadow-av-card">
            <div className="w-8 h-8 rounded-lg bg-av-orange-light flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-av-orange" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-700 font-semibold block mb-0.5">Draft Mode Active</span>
              Your progress is automatically saved. Resume anytime from your dashboard.
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-av-card p-6 sm:p-10 lg:p-12">
          <Outlet />
        </div>

        <footer className="mt-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-200 pt-8 text-slate-400 text-xs font-medium">
          <p>© {new Date().getFullYear()} Absolute Veritas Quality Assurance. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingLayout;
```

- [ ] **Step 7.2 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 7.3 — Commit**

```
git add frontend/src/components/booking/BookingLayout.jsx
git commit -m "style: remove gradient blobs from booking layout, fix card radii"
```

---

## Task 8: Fix Stepper Pills

**Files:**
- Modify: `frontend/src/components/booking/Stepper.jsx`

- [ ] **Step 8.1 — Change step pill shape from rounded-full to rounded-lg**

On line 34, find:
```
"step-item flex items-center gap-2 min-w-max px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors",
```
Change `rounded-full` to `rounded-lg`.

On line 43, find:
```
"flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold",
```
Change the badge `rounded-full` to `rounded`.

- [ ] **Step 8.2 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 8.3 — Commit**

```
git add frontend/src/components/booking/Stepper.jsx
git commit -m "style: change stepper pills from rounded-full to rounded-lg"
```

---

## Task 9: Auth Pages — Remove Blobs, Fix Card Radius

**Files:**
- Modify: `frontend/src/pages/auth/Login.jsx`
- Modify: `frontend/src/pages/auth/Signup.jsx`

- [ ] **Step 9.1 — Fix Login.jsx**

Remove the `{/* Background Decor */}` block (lines 44–48 — the entire fixed div with two blur divs inside).

Change line 53:
```
className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10"
```
to:
```
className="max-w-md w-full bg-white rounded-xl shadow-av-card border border-slate-100 p-8 sm:p-10"
```

Change line 68 (error card radius):
```
className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-[16px] text-rose-600 text-sm font-medium"
```
to:
```
className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-sm font-medium"
```

- [ ] **Step 9.2 — Fix Signup.jsx**

Signup has no background blobs. Fix two card radius values:

Line 60 (success card):
```
className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center"
```
→
```
className="max-w-md w-full bg-white rounded-xl shadow-av-card border border-slate-100 p-10 text-center"
```

Line 86 (main form card):
```
className="max-w-2xl w-full bg-white rounded-[16px] shadow-lg border border-slate-200 p-8 sm:p-12"
```
→
```
className="max-w-2xl w-full bg-white rounded-xl shadow-av-card border border-slate-100 p-8 sm:p-12"
```

- [ ] **Step 9.3 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 9.4 — Commit**

```
git add frontend/src/pages/auth/Login.jsx frontend/src/pages/auth/Signup.jsx
git commit -m "style: remove gradient blobs from auth pages, fix card radius"
```

---

## Task 10: Fix Modal Radius

**Files:**
- Modify: `frontend/src/components/ui/Modal.jsx`

- [ ] **Step 10.1 — Fix rounded-[16px] in Modal.jsx**

Line 79, change:
```
className={`relative bg-white rounded-[16px] shadow-xl w-full ${sizes[size]} transform transition-transform duration-300 ${
```
to:
```
className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} transform transition-transform duration-300 ${
```

Line 116, change:
```
<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-[16px]">
```
to:
```
<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
```

- [ ] **Step 10.2 — Lint**

```
cd frontend && npm run lint
```

- [ ] **Step 10.3 — Commit**

```
git add frontend/src/components/ui/Modal.jsx
git commit -m "style: fix modal corner radius"
```

---

## Task 11: Verify — Run App, Visual Check

- [ ] **Step 11.1 — Start dev server**

```
cd frontend && npm run dev
```

Open `http://localhost:5174` in browser.

- [ ] **Step 11.2 — Visual checklist**

Navigate to each page and verify:

| Page | Check |
|---|---|
| `/login` | No gradient blobs, card has tight 12px corners |
| `/register` | Same as login |
| `/dashboard` | Clean page header (title + date + buttons), left-border stat cards, always-expanded sidebar with nav sections |
| `/dashboard/bookings` | Table has 8px container radius |
| `/booking/create` | No blobs in background, step card has `rounded-xl`, pill steps are rectangular |
| Sidebar | Always expanded at 232px, user row pinned to bottom, no collapse button |

- [ ] **Step 11.3 — Final lint + build check**

```
cd frontend && npm run lint && npm run build
```

Expected: lint passes, build succeeds with no errors.

- [ ] **Step 11.4 — Final commit**

```
git add -A
git commit -m "style: professional UI redesign complete — 8px radius, no blobs, clean dashboard"
```
