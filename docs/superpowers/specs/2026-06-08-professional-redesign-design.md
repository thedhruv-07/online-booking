# Professional UI Redesign — Design Spec

**Date:** 2026-06-08  
**Status:** Approved  
**Scope:** Full frontend redesign — dashboard, booking wizard, auth pages, admin

---

## 1. Goal

Remove all "vibe coded" patterns from the Absolute Veritas booking portal and replace them with a consistent, professional B2B design that matches the authority of an inspection and certification business.

The brand colours (`#F58220` orange, `#0B3A70` navy) are **retained**. Nothing about brand identity changes — only the execution quality.

---

## 2. Design Direction: Structured Professional

Inspired by Notion, Intercom, and Linear. Characteristics:
- White sidebar with navy branding
- Clean data tables with tight row density
- Left-border accent strips on metric cards (no icon circles)
- No decorative blur gradients anywhere
- Restrained use of colour — orange and navy as accents only, not fills

---

## 3. Design Tokens (Tailwind Config Changes)

### Border Radius
| Token | Old value | New value |
|---|---|---|
| `av-rounded` (default) | `16px` | `8px` |
| Buttons | `16px` | `8px` |
| Badges | `8px` | `5px` |
| Inputs | `16px` | `8px` |
| Large cards (BookingLayout) | `40px` | `12px` |

Remove all `rounded-[2.5rem]`, `rounded-[40px]`, `rounded-full` on non-pill elements.

### Shadows
| Token | Old value | New value |
|---|---|---|
| `av-card` | `0 2px 8px rgba(0,0,0,0.05)` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| `av-hover` | `0 8px 24px rgba(0,0,0,0.08)` | `0 4px 12px rgba(0,0,0,0.08)` |

Remove `shadow-2xl`, `shadow-xl` from regular cards. Reserve for modals only.

### Spacing
No new tokens needed. Standardise usage:
- Page content padding: `px-6 py-6`
- Card internal padding: `p-5` (large), `p-4` (small)
- Section gap: `gap-4` between cards, `gap-3` within cards
- Stats grid gap: `gap-3`

### Typography Hierarchy
| Role | Classes | Usage |
|---|---|---|
| Page title | `text-xl font-bold text-slate-900 tracking-tight` | One per page |
| Section title | `text-sm font-bold text-slate-900` | Card headers |
| Body | `text-sm text-slate-600` | Descriptions, paragraphs |
| Label/meta | `text-xs text-slate-400 font-medium` | Subtitles, dates, counts |
| Table cell | `text-sm text-slate-700` | Table body |
| Table header | `text-xs font-bold text-slate-400 uppercase tracking-wider` | `<th>` cells |

Remove: `font-black`, `text-gradient`, uppercase badge labels on page sections, `tracking-widest` on section titles.

---

## 4. Layout

### Note on Layout.jsx
There is no separate `Layout.jsx` file. `src/components/layout/index.js` re-exports `MainLayout` as `Layout`. `AppRoutes.jsx` already imports `MainLayout` under the `Layout` name — no file deletion or route changes needed.

### Sidebar (`MainLayout.jsx` + `Sidebar.jsx`)
**Current:** Collapsible (240px ↔ 72px), framer-motion width animation, `isSidebarCollapsed` state from `uiStore.js`.  
**New:** Always expanded at 232px. No collapse button. No collapse state.

`uiStore.js` cleanup: remove `isSidebarCollapsed`, `toggleSidebar`, `setSidebarCollapsed` — the store becomes empty and can be deleted if nothing else uses it. `MainLayout.jsx` removes the `pl-[72px]`/`pl-[240px]` dynamic padding and uses fixed `pl-[232px]`.

Structure:
```
┌─────────────────────┐
│ Absolute Veritas    │  ← logo-name: font-bold text-av-navy
│ INSPECTION PORTAL   │  ← tagline: text-xs uppercase tracking-wide text-slate-400
├─────────────────────┤
│ OVERVIEW            │  ← section label: text-[10px] uppercase tracking-widest text-slate-300
│   Dashboard         │  ← nav item: active = bg-orange-50 text-orange-700
│   My Bookings       │
│ ACTIONS             │
│   Create Booking    │
│   Payments          │
│ ACCOUNT             │
│   Profile           │
│   Settings          │
├─────────────────────┤
│ [DK] Dhruv Kumar    │  ← user row pinned to bottom, above Log out
│      cs@absolu...   │
│   Log out           │
└─────────────────────┘
```

Nav item active state: `bg-orange-50 text-orange-700 font-semibold` (no orange bg on non-active items).  
Nav item hover: `hover:bg-slate-50 hover:text-slate-800`.  
Icons: keep lucide-react, size 16, `strokeWidth={1.75}`.

### Topbar (`Navbar.jsx`)
Keep search + user pill. Remove orange hover accents on dropdown items — use `hover:bg-slate-50` instead.  
Height stays `h-16`. Background `bg-white border-b border-slate-100`.

---

## 5. Dashboard Page (`pages/dashboard/DashboardPage.jsx`)

### Remove
- `WelcomeBanner.jsx` — the blur-gradient hero card. Delete the component entirely.

### New Page Header
Inline `PageHeader` component (local to `DashboardPage`, not extracted):
```jsx
<div className="flex items-start justify-between mb-1">
  <div>
    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
    <p className="text-xs text-slate-400 mt-1">{formattedDate} · Absolute Veritas</p>
  </div>
  <div className="flex gap-2">
    <Button variant="secondary" size="sm">View Bookings</Button>
    <Button variant="primary" size="sm">+ New Booking</Button>
  </div>
</div>
<hr className="border-slate-100 my-4" />
```

### Stats Cards (`StatsCard.jsx`)
**Remove:** Circular icon container (`p-2 rounded-full bg-*-50`), icon inside each stat, hover translate animation.  
**New:** Left-border accent strip, number + label only.

```jsx
<div className="bg-white border border-slate-100 rounded-lg p-4 border-l-[3px] border-l-av-orange">
  <div className="text-2xl font-bold text-slate-900">{value}</div>
  <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
</div>
```

Six stat cards, left-border colours:
| Stat | Border colour |
|---|---|
| Total Bookings | `border-l-av-orange` |
| Scheduled Inspections | `border-l-av-navy` |
| In Progress | `border-l-amber-400` |
| Completed Reports | `border-l-emerald-500` |
| Certificates Issued | `border-l-violet-400` |
| Pending Payments | `border-l-rose-400` |

### Recent Bookings Table (`RecentBookingsTable.jsx`)
Keep structure. Visual changes only:
- Table container: `rounded-lg` (was `rounded-[16px]`)
- Row height: `py-3` (was `py-4`) — tighter
- Table header background: `bg-slate-50` (was same as card bg)
- Remove `hover:-translate-y` on rows — use `hover:bg-slate-50` only
- Status badges: `rounded-[5px]` (was `rounded-lg`)

### Quick Actions (`QuickActions.jsx`)
Remove the right-pointing arrow colour-transition animation. Keep icon + title + subtitle structure. Icon containers: `rounded-lg bg-orange-50` / `bg-blue-50` / `bg-emerald-50` — keep these, they're subtle enough.

---

## 6. Booking Wizard

### BookingLayout.jsx
**Remove:** The fixed-position background blobs (`fixed top-0 left-0 ... blur-[120px] opacity-40` and `blur-[100px] opacity-30`). This is the entire `{/* Background Decor */}` div block at the top of the return.  
**Change:** Main step card `rounded-[2.5rem]` → `rounded-xl` and `shadow-2xl shadow-slate-200/40` → `shadow-sm border border-slate-100`.  
**Change:** Draft Mode info card `rounded-3xl` → `rounded-lg`, icon container `rounded-[16px]` → `rounded-lg`.  
Background stays `bg-slate-50`, card stays white.

### Stepper.jsx
No structural changes. Visual:
- Pill border-radius: `rounded-lg` (was `rounded-full`)
- Active pill: `bg-av-orange text-white` — keep
- Completed pill: `bg-av-navy text-white` — keep

### Step Forms (ServiceStep, LocationStep, ProductStep, etc.)
No blob decorations exist in any step file — blobs were only in `WelcomeBanner.jsx` and `BookingLayout.jsx`.  
Audit each step file for any `rounded-[x]` or `rounded-3xl` on internal section cards and change to `rounded-lg`. Form fields (inputs, selects, labels with icons) stay unchanged.

---

## 7. Auth Pages

`LoginPage.jsx`, `RegisterPage.jsx`, `ActivationPage.jsx`:  
**Remove:** Any blur gradient decorative divs.  
**Change:** Auth card `rounded-[40px]` → `rounded-xl`.  
Otherwise leave structure unchanged.

---

## 8. UI Primitives (`components/ui/`)

### Button.jsx
Change `rounded-av` (16px) → `rounded-lg` (8px) on all variants.  
Remove `-translate-y-0.5` hover lift — use subtle `hover:brightness-105` instead.

### Input.jsx / Textarea.jsx / Select.jsx
Change `rounded-av` → `rounded-lg`.  
Focus ring stays (`ring-av-orange/10`).

### Modal.jsx
Keep `rounded-[16px]` → change to `rounded-xl` (12px).  
Overlay stays `bg-slate-900/40 backdrop-blur-sm`.

### Badge / status chips
Change `rounded-lg` → `rounded-[5px]`.

---

## 9. What Is NOT Changing

- Colour palette tokens (`av-orange`, `av-navy`, `av-light-blue`, `av-orange-light`) — keep all
- Framer Motion step transition animations — keep
- AQL calculator logic and display
- Payment flow (Razorpay + Bank Transfer) — no UI changes
- Admin pages — out of scope for this redesign
- Backend — zero changes
- Responsive breakpoints — keep existing `sm:`/`md:`/`lg:` usage

---

## 10. Files Affected (estimated)

| File | Change type |
|---|---|
| `tailwind.config.js` | Token updates (radius, shadows) |
| `src/index.css` | Shadow values, remove `.text-gradient` class |
| `src/components/layout/MainLayout.jsx` | Remove collapse logic, simplify |
| `src/components/layout/Sidebar.jsx` | Rewrite to always-expanded, new structure |
| `src/store/uiStore.js` | Remove collapse state (or delete if nothing else uses it) |
| `src/components/layout/Navbar.jsx` | Minor hover colour fixes |
| `src/components/dashboard/WelcomeBanner.jsx` | **Delete** |
| `src/pages/dashboard/DashboardPage.jsx` | Add inline PageHeader, remove WelcomeBanner |
| `src/components/dashboard/StatsCard.jsx` | Rewrite card markup (remove icon circles) |
| `src/components/dashboard/RecentBookingsTable.jsx` | Radius + spacing tightening |
| `src/components/dashboard/QuickActions.jsx` | Remove arrow animation |
| `src/components/booking/BookingLayout.jsx` | Remove blob decorations, fix radius |
| `src/components/booking/Stepper.jsx` | Pill radius fix |
| `src/components/steps/ServiceStep.jsx` | Remove blob decorations |
| `src/components/steps/LocationStep.jsx` | Remove blob decorations |
| `src/components/steps/ProductStep.jsx` | Remove blob decorations (if any) |
| `src/components/steps/DocumentStep.jsx` | Remove blob decorations (if any) |
| `src/components/steps/FactoryStep.jsx` | Remove blob decorations (if any) |
| `src/components/steps/AqlStep.jsx` | Remove blob decorations (if any) |
| `src/components/steps/OverviewStep.jsx` | Remove blob decorations (if any) |
| `src/components/steps/PaymentStep.jsx` | Remove blob decorations (if any) |
| `src/components/ui/Button.jsx` | Radius + hover change |
| `src/components/ui/Input.jsx` | Radius change |
| `src/components/ui/Textarea.jsx` | Radius change |
| `src/components/ui/Select.jsx` | Radius change |
| `src/components/ui/Modal.jsx` | Radius change |
| `src/pages/auth/LoginPage.jsx` | Remove blobs, fix card radius |
| `src/pages/auth/RegisterPage.jsx` | Remove blobs, fix card radius |
