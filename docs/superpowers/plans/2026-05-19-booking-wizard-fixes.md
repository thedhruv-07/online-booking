# Booking Wizard Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 8 gaps between the current booking wizard and the absoluteveritas.com spec: auth navbar, PDF-only upload, location pricing popup, factory/contact save-and-select dropdowns, overview submission, payment redirect, and bank-transfer confirm flow in My Bookings.

**Architecture:** Frontend-only React 19 + Vite app in `frontend/src/`. State managed by React Context + useReducer (authStore, bookingStore). No test framework exists — verification is done by running the dev server and checking behavior in a browser. All commands run from `frontend/`.

**Tech Stack:** React 19, Vite, Tailwind CSS, Framer Motion, Zustand (UI only), Axios (via `src/services/api.js`), react-hot-toast, lucide-react, `@shared/pricing` alias resolving to `../shared/pricing.js`.

---

## File Map

| File | Action |
|------|--------|
| `src/components/layout/AuthNavbar.jsx` | **Create** |
| `src/pages/auth/Login.jsx` | Modify — add AuthNavbar |
| `src/pages/auth/Signup.jsx` | Modify — add AuthNavbar |
| `src/components/steps/UploadStep.jsx` | Modify — PDF-only + UI polish |
| `src/components/steps/LocationStep.jsx` | Modify — add pricing modal |
| `src/services/factory.service.js` | **Create** |
| `src/components/steps/FactoryStep.jsx` | Rewrite — dropdown + add-new inline form |
| `src/services/contact.service.js` | **Create** |
| `src/components/steps/ContactStep.jsx` | Rewrite — dropdown + add-new inline form |
| `src/components/steps/OverviewStep.jsx` | Modify — submit logic + rename button |
| `src/components/steps/PaymentStep.jsx` | Rewrite — confirmation screen, no payment form |
| `src/services/payment.service.js` | Modify — add `uploadBankReceipt` method |
| `src/pages/dashboard/MyBookings.jsx` | Modify — bank-transfer confirm button + receipt modal |

---

## Task 1: AuthNavbar component + Login/Signup integration

**Files:**
- Create: `frontend/src/components/layout/AuthNavbar.jsx`
- Modify: `frontend/src/pages/auth/Login.jsx`
- Modify: `frontend/src/pages/auth/Signup.jsx`

- [ ] **Step 1: Create AuthNavbar**

Create `frontend/src/components/layout/AuthNavbar.jsx`:

```jsx
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const AuthNavbar = () => {
  const { pathname } = useLocation();
  const isSignup = pathname === '/signup';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-lg tracking-tight">Absolute Veritas</span>
      </div>
      {isSignup ? (
        <Link
          to="/login"
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm"
        >
          Sign In
        </Link>
      ) : (
        <Link
          to="/signup"
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm"
        >
          Create Account
        </Link>
      )}
    </header>
  );
};

export default AuthNavbar;
```

- [ ] **Step 2: Add AuthNavbar to Login.jsx**

In `frontend/src/pages/auth/Login.jsx`, add the import and wrapper. Replace the opening of the return:

```jsx
import AuthNavbar from '../../components/layout/AuthNavbar';
```

Change the outer div from:
```jsx
<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
```
to:
```jsx
<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20">
  <AuthNavbar />
```

- [ ] **Step 3: Add AuthNavbar to Signup.jsx**

In `frontend/src/pages/auth/Signup.jsx`, add the import and wrapper. Replace the outer div opening:

```jsx
import AuthNavbar from '../../components/layout/AuthNavbar';
```

Change:
```jsx
<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
```
to:
```jsx
<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24 pb-12">
  <AuthNavbar />
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev` from `frontend/`. Open `http://localhost:5174/login`.
Expected: Top bar with "Absolute Veritas" logo left, "Create Account" button right.
Open `/signup` — button should say "Sign In".

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/AuthNavbar.jsx frontend/src/pages/auth/Login.jsx frontend/src/pages/auth/Signup.jsx
git commit -m "feat: add auth navbar with Create Account / Sign In button"
```

---

## Task 2: UploadStep — PDF-only + UI polish

**Files:**
- Modify: `frontend/src/components/steps/UploadStep.jsx`

- [ ] **Step 1: Rewrite UploadStep**

Replace the entire contents of `frontend/src/components/steps/UploadStep.jsx`:

```jsx
import { useBooking } from '../../hooks/useBooking';
import { FileUpload, Alert } from '../ui';
import { StepNavigation } from '../booking';
import { FileText } from 'lucide-react';

const UploadStep = () => {
  const { bookingData, setFiles, removeFile, prevStep, nextStep } = useBooking();

  const handleFilesSelected = (files, isMultiple) => {
    if (isMultiple) {
      setFiles([...bookingData.files, ...files]);
    } else {
      setFiles([...bookingData.files, files[0]]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Documents</h2>
        <p className="text-slate-500 font-medium">
          Upload your product specification or inspection checklist.{' '}
          <strong>PDF documents only</strong> — max 10 MB each, up to 5 files.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {bookingData.files.length > 0 && (
          <Alert type="info">
            <strong>{bookingData.files.length} file{bookingData.files.length > 1 ? 's' : ''}</strong>{' '}
            uploaded
          </Alert>
        )}

        <FileUpload
          onFilesSelected={handleFilesSelected}
          existingFiles={bookingData.files}
          onRemoveFile={(id) => removeFile(id)}
          multiple
          maxFiles={5}
          accept=".pdf"
          maxSize={10 * 1024 * 1024}
        />
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={nextStep}
        nextLabel="Continue to Factory"
      />
    </div>
  );
};

export default UploadStep;
```

- [ ] **Step 2: Verify in browser**

Navigate to `/booking/create`, advance to step 4 (Upload). Try uploading a `.docx` — it should be rejected. Upload a `.pdf` — it should succeed. The step should now have a styled header matching other steps.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/steps/UploadStep.jsx
git commit -m "feat: enforce PDF-only upload and polish Upload step UI"
```

---

## Task 3: LocationStep — pricing modal on country change

**Files:**
- Modify: `frontend/src/components/steps/LocationStep.jsx`

- [ ] **Step 1: Rewrite LocationStep with pricing modal**

Replace the entire contents of `frontend/src/components/steps/LocationStep.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { Input, Select, Modal } from '../ui';
import { getCountries, getStatesByCountry } from '../../utils/geoData';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Navigation, Mail } from 'lucide-react';
import { StepNavigation } from '../booking';
import { cn } from '../../utils/cn';

// @shared/pricing uses a default export on some bundlers; handle both
import * as _pricing from '@shared/pricing';
const { calculateFinalPrice, services: allServices } = _pricing.default || _pricing;

const LocationStep = () => {
  const { updateStepData, bookingData, nextStep, prevStep } = useBooking();

  const [formData, setFormData] = useState({
    country: bookingData.location?.country || '',
    city: bookingData.location?.city || '',
    address: bookingData.location?.address || '',
    postalCode: bookingData.location?.postalCode || '',
  });

  const [availableStates, setAvailableStates] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Track the country that was already saved (hydrated from draft) so we
  // don't fire the modal when the step first loads with a saved country.
  const initialCountryRef = useRef(bookingData.location?.country || '');

  useEffect(() => {
    if (formData.country) {
      setAvailableStates(getStatesByCountry(formData.country));
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);

  // Show pricing modal only when user actively changes the country
  useEffect(() => {
    if (formData.country && formData.country !== initialCountryRef.current) {
      setShowPricingModal(true);
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { city: '' } : {}),
    }));
  };

  const handleContinue = () => {
    updateStepData('location', formData);
    nextStep();
  };

  const countries = getCountries();
  const isFormValid = formData.country && formData.city && formData.address && formData.postalCode;

  // Pricing calculation for the modal
  const selectedServiceIds = bookingData.service?.selected || [];
  const pricingResult = formData.country
    ? calculateFinalPrice(selectedServiceIds, formData.country)
    : null;
  const countryName = countries.find((c) => c.id === formData.country)?.name || formData.country;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <MapPin size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Location Details</h2>
        <p className="text-slate-500 font-medium">
          Specify where the inspection will take place. This helps us assign the nearest certified inspector.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <Globe size={14} className="text-indigo-500" />
              Country
            </label>
            <Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countries}
              placeholder="Select Country"
              required
            />
          </div>

          {/* State / Province */}
          <AnimatePresence mode="wait">
            <motion.div
              key={formData.country || 'no-country'}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Navigation size={14} className="text-indigo-500" />
                State / Province
              </label>
              <Select
                name="city"
                value={formData.city}
                onChange={handleChange}
                options={availableStates}
                placeholder={formData.country ? 'Select State' : 'Select Country First'}
                disabled={!formData.country}
                required
              />
            </motion.div>
          </AnimatePresence>

          {/* Address */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500" />
              Detailed Address
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street name, building number, suite, etc."
              required
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
              <Mail size={14} className="text-indigo-500" />
              Postal / ZIP Code
            </label>
            <Input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g. 10001"
              required
            />
          </div>
        </div>

        <StepNavigation
          onBack={prevStep}
          onNext={handleContinue}
          isValid={!!isFormValid}
          nextLabel="Continue to Product"
        />
      </div>

      {/* Pricing modal */}
      <Modal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        title={`Service Pricing for ${countryName}`}
        size="sm"
      >
        <div className="space-y-4 py-2">
          {pricingResult && (
            <>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest',
                  pricingResult.region === 'covered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                )}
              >
                {pricingResult.region === 'covered' ? '✓ Covered Region' : 'Standard Region'}
              </span>

              {selectedServiceIds.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {selectedServiceIds.map((id) => {
                    const svc = allServices.find((s) => s.id === id);
                    if (!svc) return null;
                    return (
                      <div key={id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">{svc.name}</span>
                        <span className="font-bold text-slate-900">
                          ${svc.pricing[pricingResult.region]}
                        </span>
                      </div>
                    );
                  })}
                  {pricingResult.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-emerald-600">
                      <span className="font-medium">Bundle Discount</span>
                      <span className="font-bold">-${pricingResult.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-xl font-black text-slate-900">
                      ${pricingResult.totalAmount}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 font-medium">
                  Return to step 1 to select services first.
                </p>
              )}
            </>
          )}

          <button
            onClick={() => setShowPricingModal(false)}
            className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
          >
            Continue with this pricing
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LocationStep;
```

- [ ] **Step 2: Verify in browser**

Navigate to the booking wizard step 2 (Location). Select a country — a modal should appear showing the pricing for that country. Dismiss it. Change to a different country — modal should fire again. Going *back* to this step with a saved draft should NOT fire the modal on load.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/steps/LocationStep.jsx
git commit -m "feat: add service pricing popup on country selection in Location step"
```

---

## Task 4: Factory service file

**Files:**
- Create: `frontend/src/services/factory.service.js`

- [ ] **Step 1: Create factory.service.js**

Create `frontend/src/services/factory.service.js`:

```js
import { api } from './api';

export const factoryService = {
  getFactories: async () => {
    const response = await api.get('/user/factories');
    // Normalise: backend may return { data: [...] } or [...]
    return Array.isArray(response) ? response : (response?.data ?? []);
  },

  createFactory: async ({ name, location, phone }) => {
    const response = await api.post('/user/factories', { name, location, phone });
    return response?.data ?? response;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/factory.service.js
git commit -m "feat: add factory service (GET/POST /user/factories)"
```

---

## Task 5: FactoryStep — dropdown + Add New inline form

**Files:**
- Modify: `frontend/src/components/steps/FactoryStep.jsx`

- [ ] **Step 1: Rewrite FactoryStep**

Replace the entire contents of `frontend/src/components/steps/FactoryStep.jsx`:

```jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, Plus, Check, Loader2, X } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { Input, Select, SearchableSelect } from '../ui';
import { StepNavigation } from '../booking';
import { getPhoneCodes } from '../../utils/geoData';
import { factoryService } from '../../services/factory.service';

const FactoryStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();

  const [savedFactories, setSavedFactories] = useState([]);
  const [isLoadingFactories, setIsLoadingFactories] = useState(true);
  const [selectedFactoryId, setSelectedFactoryId] = useState(
    bookingData.factory?._id || bookingData.factory?.id || ''
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    address: '',
    phone: '',
    phonePrefix: '+86',
  });

  const phoneCodes = useMemo(() => getPhoneCodes(), []);

  useEffect(() => {
    factoryService
      .getFactories()
      .then((list) => setSavedFactories(list))
      .catch(() => setSavedFactories([]))
      .finally(() => setIsLoadingFactories(false));
  }, []);

  // Options for the select: saved factories + sentinel for Add New
  const selectOptions = useMemo(() => [
    ...savedFactories.map((f) => ({ id: f._id, name: f.name })),
    { id: '__add_new__', name: '+ Add New Factory' },
  ], [savedFactories]);

  const selectedFactory = savedFactories.find((f) => f._id === selectedFactoryId);

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setValidationError('');
    if (val === '__add_new__') {
      setShowAddForm(true);
      setSelectedFactoryId('');
    } else {
      setSelectedFactoryId(val);
      setShowAddForm(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFactory = async () => {
    if (!addForm.name || !addForm.address || !addForm.phone) {
      setValidationError('Please fill in all factory fields');
      return;
    }
    setIsSaving(true);
    try {
      const created = await factoryService.createFactory({
        name: addForm.name,
        location: addForm.address,
        phone: `${addForm.phonePrefix} ${addForm.phone}`,
      });
      setSavedFactories((prev) => [...prev, created]);
      setSelectedFactoryId(created._id);
      setShowAddForm(false);
      setAddForm({ name: '', address: '', phone: '', phonePrefix: '+86' });
    } catch (err) {
      setValidationError(err.message || 'Failed to save factory');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setValidationError('');
  };

  const handleContinue = () => {
    if (!selectedFactory) {
      setValidationError(
        showAddForm
          ? 'Please save the new factory before continuing'
          : 'Please select or add a factory'
      );
      return;
    }
    updateStepData('factory', {
      _id: selectedFactory._id,
      id: selectedFactory._id,
      name: selectedFactory.name,
      location: selectedFactory.location,
      phone: selectedFactory.phone,
    });
    nextStep();
  };

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Factory size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Factory Details</h2>
        <p className="text-slate-500 font-medium">
          Select a saved factory or add a new one.
        </p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center max-w-2xl mx-auto">
          {validationError}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropdown */}
        {isLoadingFactories ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Select Factory <span className="text-rose-500">*</span>
            </label>
            <Select
              name="factory"
              value={selectedFactoryId}
              onChange={handleDropdownChange}
              options={selectOptions}
              placeholder="Choose a saved factory or add new..."
            />
          </div>
        )}

        {/* Selected factory summary card */}
        <AnimatePresence>
          {selectedFactory && !showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Selected Factory</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-bold text-slate-500">Name:</span>{' '}<span className="text-slate-800 font-semibold">{selectedFactory.name}</span></p>
                <p><span className="font-bold text-slate-500">Address:</span>{' '}<span className="text-slate-800 font-semibold">{selectedFactory.location}</span></p>
                <p><span className="font-bold text-slate-500">Phone:</span>{' '}<span className="text-slate-800 font-semibold">{selectedFactory.phone}</span></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/40 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">New Factory</h3>
                </div>
                <button onClick={cancelAdd} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Factory Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    placeholder="e.g. Guangzhou Manufacturing Hub"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <SearchableSelect
                      name="phonePrefix"
                      value={addForm.phonePrefix}
                      onChange={handleAddFormChange}
                      options={phoneCodes}
                      className="w-32"
                      wrapperClassName="mb-0 w-32"
                      placeholder="+Code"
                      searchPlaceholder="Search..."
                    />
                    <Input
                      name="phone"
                      value={addForm.phone}
                      onChange={handleAddFormChange}
                      placeholder="XXX XXXX XXXX"
                      className="flex-1"
                      wrapperClassName="mb-0 flex-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Factory Full Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={addForm.address}
                    onChange={handleAddFormChange}
                    placeholder="Building number, street, district, city..."
                    rows={3}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={handleSaveFactory}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? 'Saving...' : 'Save Factory'}
                </button>
                <button
                  onClick={cancelAdd}
                  className="text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={handleContinue}
        isValid={!!selectedFactory && !showAddForm}
        nextLabel="Continue to Contact"
      />
    </div>
  );
};

export default FactoryStep;
```

- [ ] **Step 2: Verify in browser**

Navigate to the Factory step. Expected:
- Dropdown loads with "Choose a saved factory or add new..." (empty list on first use, or saved factories if backend returns them)
- Selecting "+ Add New Factory" slides in the inline form
- Filling in the form and clicking "Save Factory" should POST to `/user/factories`, then auto-select the new entry and show the summary card
- If backend returns 404 (not implemented), the factory list loads as empty — "Add New" still works but the save call will fail. That's acceptable.
- Back button persists the selected factory when returning from a later step

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/steps/FactoryStep.jsx
git commit -m "feat: factory step with saved-factory dropdown and Add New inline form"
```

---

## Task 6: Contact service file

**Files:**
- Create: `frontend/src/services/contact.service.js`

- [ ] **Step 1: Create contact.service.js**

Create `frontend/src/services/contact.service.js`:

```js
import { api } from './api';

export const contactService = {
  getContacts: async () => {
    const response = await api.get('/user/contacts');
    return Array.isArray(response) ? response : (response?.data ?? []);
  },

  createContact: async ({ name, email, phone, designation }) => {
    const response = await api.post('/user/contacts', { name, email, phone, designation });
    return response?.data ?? response;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/contact.service.js
git commit -m "feat: add contact service (GET/POST /user/contacts)"
```

---

## Task 7: ContactStep — dropdown + Add New inline form

**Files:**
- Modify: `frontend/src/components/steps/ContactStep.jsx`

- [ ] **Step 1: Rewrite ContactStep**

Replace the entire contents of `frontend/src/components/steps/ContactStep.jsx`:

```jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Check, Loader2, User, X } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../store/authStore';
import { Input, Select, SearchableSelect } from '../ui';
import { StepNavigation } from '../booking';
import { getPhoneCodes } from '../../utils/geoData';
import { contactService } from '../../services/contact.service';
import { cn } from '../../utils/cn';

const ContactStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const { user } = useAuth();

  const [savedContacts, setSavedContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState(
    bookingData.contact?._id || bookingData.contact?.id || ''
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [useProfile, setUseProfile] = useState(false);

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    phonePrefix: '+86',
    designation: '',
  });

  const phoneCodes = useMemo(() => getPhoneCodes(), []);

  useEffect(() => {
    contactService
      .getContacts()
      .then((list) => setSavedContacts(list))
      .catch(() => setSavedContacts([]))
      .finally(() => setIsLoadingContacts(false));
  }, []);

  // Auto-fill form from user profile when toggle is on
  useEffect(() => {
    if (useProfile && user) {
      setAddForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone?.replace(/^\+\d+\s/, '') || '',
        phonePrefix: user.phone?.match(/^\+\d+/)?.[0] || '+86',
        designation: user.designation || 'Client Contact',
      });
    }
  }, [useProfile, user]);

  const selectOptions = useMemo(() => [
    ...savedContacts.map((c) => ({ id: c._id, name: c.name })),
    { id: '__add_new__', name: '+ Add New Contact' },
  ], [savedContacts]);

  const selectedContact = savedContacts.find((c) => c._id === selectedContactId);

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setValidationError('');
    if (val === '__add_new__') {
      setShowAddForm(true);
      setSelectedContactId('');
    } else {
      setSelectedContactId(val);
      setShowAddForm(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (useProfile) setUseProfile(false);
  };

  const handleSaveContact = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.designation) {
      setValidationError('Please fill in all contact fields');
      return;
    }
    setIsSaving(true);
    try {
      const created = await contactService.createContact({
        name: addForm.name,
        email: addForm.email,
        phone: `${addForm.phonePrefix} ${addForm.phone}`,
        designation: addForm.designation,
      });
      setSavedContacts((prev) => [...prev, created]);
      setSelectedContactId(created._id);
      setShowAddForm(false);
      setAddForm({ name: '', email: '', phone: '', phonePrefix: '+86', designation: '' });
    } catch (err) {
      setValidationError(err.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setValidationError('');
  };

  const handleContinue = () => {
    if (!selectedContact) {
      setValidationError(
        showAddForm
          ? 'Please save the new contact before continuing'
          : 'Please select or add a contact person'
      );
      return;
    }
    updateStepData('contact', {
      _id: selectedContact._id,
      id: selectedContact._id,
      name: selectedContact.name,
      email: selectedContact.email,
      phone: selectedContact.phone,
      designation: selectedContact.designation,
    });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Users size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Factory Contact</h2>
        <p className="text-slate-500 font-medium">
          Select a saved contact or add a new one. Our inspector will reach out to this person to confirm the visit.
        </p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center">
          {validationError}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropdown */}
        {isLoadingContacts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Select Contact <span className="text-rose-500">*</span>
            </label>
            <Select
              name="contact"
              value={selectedContactId}
              onChange={handleDropdownChange}
              options={selectOptions}
              placeholder="Choose a saved contact or add new..."
            />
          </div>
        )}

        {/* Selected contact summary card */}
        <AnimatePresence>
          {selectedContact && !showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-blue-50 border border-blue-100 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Selected Contact</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="font-bold text-slate-500">Name:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.name}</span></p>
                <p><span className="font-bold text-slate-500">Email:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.email}</span></p>
                <p><span className="font-bold text-slate-500">Phone:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.phone}</span></p>
                <p><span className="font-bold text-slate-500">Designation:</span>{' '}<span className="text-slate-800 font-semibold">{selectedContact.designation}</span></p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline add form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/40 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">New Contact</h3>
                </div>
                <button onClick={cancelAdd} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Profile auto-fill toggle */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                    <User size={16} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Use my profile details</p>
                </div>
                <button
                  onClick={() => setUseProfile(!useProfile)}
                  className={cn(
                    'w-12 h-7 rounded-full relative transition-all duration-300',
                    useProfile ? 'bg-blue-600' : 'bg-slate-200'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300',
                      useProfile ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <Input name="name" value={addForm.name} onChange={handleAddFormChange} placeholder="Enter Contact Name..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <Input type="email" name="email" value={addForm.email} onChange={handleAddFormChange} placeholder="Enter Email Address..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <SearchableSelect
                      name="phonePrefix"
                      value={addForm.phonePrefix}
                      onChange={handleAddFormChange}
                      options={phoneCodes}
                      className="w-32"
                      wrapperClassName="mb-0 w-32"
                      placeholder="+Code"
                      searchPlaceholder="Search..."
                    />
                    <Input
                      name="phone"
                      value={addForm.phone}
                      onChange={handleAddFormChange}
                      placeholder="Enter Phone Number..."
                      className="flex-1"
                      wrapperClassName="mb-0 flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <Input name="designation" value={addForm.designation} onChange={handleAddFormChange} placeholder="e.g. Factory Manager" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={handleSaveContact}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isSaving ? 'Saving...' : 'Save Contact'}
                </button>
                <button onClick={cancelAdd} className="text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={handleContinue}
        isValid={!!selectedContact && !showAddForm}
        nextLabel="Continue to AQL"
      />
    </div>
  );
};

export default ContactStep;
```

- [ ] **Step 2: Verify in browser**

Navigate to the Contact step. Verify same pattern as Factory: dropdown, Add New inline form, profile toggle auto-fills form fields, Save button POSTs and auto-selects.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/steps/ContactStep.jsx
git commit -m "feat: contact step with saved-contact dropdown and Add New inline form"
```

---

## Task 8: OverviewStep — submit booking + rename button

**Files:**
- Modify: `frontend/src/components/steps/OverviewStep.jsx`

- [ ] **Step 1: Add submit logic to OverviewStep**

In `frontend/src/components/steps/OverviewStep.jsx`:

**a) Change the import at the top** — add `useState`:
```jsx
import React, { useMemo, useState } from 'react';
```

**b) Add `Loader2` to the lucide imports:**
```jsx
import { 
  ClipboardCheck, 
  MapPin, 
  Package, 
  Factory, 
  User, 
  Calendar, 
  Hash,
  Shield,
  CheckSquare,
  Loader2,
} from 'lucide-react';
```

**c) Replace the `useBooking` destructure line** (currently `const { bookingData, prevStep, nextStep } = useBooking();`):
```jsx
const { bookingData, prevStep, nextStep, submitBooking, setPayment } = useBooking();
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState(null);

const handleSubmit = async () => {
  setIsSubmitting(true);
  setSubmitError(null);
  const result = await submitBooking();
  if (result.success) {
    setPayment({
      bookingId: result.booking._id,
      totalAmount: bookingData.service?.totalAmount || 0,
      serviceName: bookingData.service?.name || '',
    });
    nextStep();
  } else {
    setSubmitError(result.error || 'Failed to submit booking. Please try again.');
    setIsSubmitting(false);
  }
};
```

**d) Replace the bottom section** (the `<div className="bg-white rounded-2xl p-8 border ...">` block that contains StepNavigation) with:

```jsx
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4">
              <Shield size={12} />
              Verified Protocol
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Ready to submit your inspection request?</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              By confirming, you authorise Absolute Veritas to begin coordinating with the factory. You will be directed to complete payment on the next screen.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
            {submitError && (
              <p className="text-rose-600 text-sm font-bold text-center">{submitError}</p>
            )}
            <StepNavigation
              onBack={prevStep}
              onNext={handleSubmit}
              nextLabel={isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              isValid={!isSubmitting}
            />
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Verify in browser**

Complete all 8 wizard steps and arrive at Overview. Click "Submit Booking Request" — button should show a spinner, then if successful advance to step 9 (the confirmation screen). If the backend is unavailable, it should show a red error message inline.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/steps/OverviewStep.jsx
git commit -m "feat: overview step submits booking and passes ID to payment step"
```

---

## Task 9: PaymentStep — booking confirmation screen

**Files:**
- Modify: `frontend/src/components/steps/PaymentStep.jsx`

- [ ] **Step 1: Rewrite PaymentStep as confirmation screen**

Replace the entire contents of `frontend/src/components/steps/PaymentStep.jsx`:

```jsx
import { CheckCircle2, ExternalLink, ArrowRight, Hash } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useNavigate } from 'react-router-dom';

const PaymentStep = () => {
  const { bookingData, clearDraft } = useBooking();
  const navigate = useNavigate();

  const bookingId = bookingData.payment?.bookingId;
  const totalAmount = bookingData.payment?.totalAmount ?? bookingData.service?.totalAmount ?? 0;
  const serviceName = bookingData.payment?.serviceName || bookingData.service?.name || 'Inspection Service';
  const shortId = bookingId ? `#${bookingId.slice(-8).toUpperCase()}` : '—';

  const handleViewBookings = () => {
    clearDraft();
    navigate('/dashboard/bookings');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 space-y-10 max-w-xl mx-auto text-center">
      {/* Success icon */}
      <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shadow-sm">
        <CheckCircle2 size={52} className="text-emerald-500" />
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Submitted!</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Your inspection request has been received. Complete your payment on the next page to confirm.
        </p>
      </div>

      {/* Booking summary */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4 text-left">
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

      {/* Payment instructions */}
      <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left">
        <p className="text-sm font-bold text-amber-800 mb-2">How to complete payment:</p>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal ml-4 font-medium">
          <li>Click <strong>"Proceed to Payment"</strong> below</li>
          <li>
            Enter <strong>{shortId}</strong> in the{' '}
            <em>Invoice No. / Project Reference</em> field
          </li>
          <li>
            Enter amount: <strong>${Number(totalAmount).toFixed(2)}</strong>
          </li>
          <li>Pay via Razorpay, UPI, or Bank Transfer</li>
        </ol>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        <a
          href="https://absoluteveritas.com/online_payment.php"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Proceed to Payment
          <ExternalLink size={18} />
        </a>
        <button
          onClick={handleViewBookings}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          View My Bookings
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-xs text-slate-400 font-medium">
        Questions? Contact{' '}
        <span className="text-indigo-500">finance@absoluteveritas.com</span>
      </p>
    </div>
  );
};

export default PaymentStep;
```

- [ ] **Step 2: Verify in browser**

After submitting a booking from the Overview step, step 9 should show:
- Green checkmark icon
- "Booking Submitted!" heading
- Booking reference (last 8 chars of MongoDB `_id`)
- Service name and amount
- Amber instruction card with the booking reference filled in
- "Proceed to Payment" link opens `absoluteveritas.com/online_payment.php` in a new tab
- "View My Bookings" clears the draft and navigates to `/dashboard/bookings`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/steps/PaymentStep.jsx
git commit -m "feat: replace payment form with booking confirmation + redirect to absoluteveritas.com/online_payment.php"
```

---

## Task 10: payment.service.js — add uploadBankReceipt

**Files:**
- Modify: `frontend/src/services/payment.service.js`

- [ ] **Step 1: Add uploadBankReceipt method**

In `frontend/src/services/payment.service.js`, add this method to the `paymentService` object (after the `downloadInvoice` method, before the closing `}`):

```js
  /**
   * Upload bank transfer receipt PDF for a pending booking
   * @param {string} bookingId
   * @param {File} file - PDF receipt
   * @returns {Promise<{success: boolean}>}
   */
  uploadBankReceipt: async (bookingId, file) => {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('receipt', file);
    return api.uploadFile('/payments/bank-receipt', formData);
  },
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/payment.service.js
git commit -m "feat: add uploadBankReceipt to payment service"
```

---

## Task 11: MyBookings — bank-transfer confirm button + receipt modal

**Files:**
- Modify: `frontend/src/pages/dashboard/MyBookings.jsx`

- [ ] **Step 1: Add state and modal to MyBookings**

In `frontend/src/pages/dashboard/MyBookings.jsx`:

**a) Add new imports** at the top (add to existing import block):
```jsx
import { Upload } from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import { toast } from 'react-hot-toast';
```

**b) Add new state** inside the `MyBookings` component (after the existing `isDeleting` state):
```jsx
const [confirmTarget, setConfirmTarget] = useState(null);   // booking object
const [receiptFile, setReceiptFile] = useState(null);
const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
const [receiptError, setReceiptError] = useState('');
```

**c) Add the upload handler** (after `confirmDelete`):
```jsx
const handleReceiptFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    setReceiptError('Please upload a PDF file only.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    setReceiptError('File size must be under 10 MB.');
    return;
  }
  setReceiptFile(file);
  setReceiptError('');
};

const handleUploadReceipt = async () => {
  if (!receiptFile) {
    setReceiptError('Please select a PDF receipt to upload.');
    return;
  }
  setIsUploadingReceipt(true);
  try {
    await paymentService.uploadBankReceipt(confirmTarget._id, receiptFile);
    toast.success('Receipt uploaded — awaiting admin confirmation');
    setConfirmTarget(null);
    setReceiptFile(null);
    fetchBookings({ search: searchTerm, status: activeFilter, page: currentPage });
  } catch (err) {
    setReceiptError(err.message || 'Upload failed. Please try again.');
  } finally {
    setIsUploadingReceipt(false);
  }
};
```

**d) Add a "Confirm Payment" button in the table row action cell.** Find the `<div className="flex items-center justify-end gap-2 relative">` inside `bookings.map(...)` and add this **before** the existing Eye link:

```jsx
{booking.payment?.method === 'bank_transfer' &&
  booking.status === 'pending' &&
  !booking.payment?.receiptUploaded && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setConfirmTarget(booking);
        setReceiptFile(null);
        setReceiptError('');
      }}
      className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
      title="Upload bank transfer receipt"
    >
      <Upload size={18} />
    </button>
  )}
```

**e) Add a "Receipt Uploaded" badge variant.** In `statusStyles`, add:
```js
receipt_uploaded: 'bg-purple-50 text-purple-600 border-purple-100',
```

In the status badge JSX (where `statusStyles[status]` is used), change the expression:
```jsx
statusStyles[
  booking.payment?.receiptUploaded && booking.status === 'pending'
    ? 'receipt_uploaded'
    : status
] || statusStyles.pending
```
And update the label text for that case:
```jsx
{booking.payment?.receiptUploaded && booking.status === 'pending'
  ? 'Receipt Uploaded'
  : status.replace('_', ' ')}
```

**f) Add the receipt upload modal** just before the closing `</div>` of the component (alongside the existing delete Modal):

```jsx
<Modal
  isOpen={!!confirmTarget}
  onClose={() => { setConfirmTarget(null); setReceiptFile(null); setReceiptError(''); }}
  title="Confirm Bank Transfer"
  size="sm"
>
  <div className="space-y-5 py-2">
    <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500 font-medium">Booking</span>
        <span className="font-bold text-slate-900">
          #{confirmTarget?._id?.slice(-8).toUpperCase()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500 font-medium">Service</span>
        <span className="font-bold text-slate-900">
          {confirmTarget?.service?.name || 'Inspection'}
        </span>
      </div>
    </div>

    <p className="text-sm text-slate-600 font-medium">
      Upload your bank transfer receipt (PDF only, max 10 MB). Our team will confirm your payment manually.
    </p>

    <div>
      <input
        type="file"
        id="receipt-pdf-input"
        accept=".pdf"
        onChange={handleReceiptFileChange}
        className="hidden"
      />
      <label
        htmlFor="receipt-pdf-input"
        className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all"
      >
        <Upload size={20} className="text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          {receiptFile ? receiptFile.name : 'Click to select PDF'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">PDF only, max 10 MB</p>
      </label>
    </div>

    {receiptError && (
      <p className="text-rose-600 text-sm font-bold">{receiptError}</p>
    )}

    <div className="flex gap-3 pt-2">
      <button
        onClick={() => { setConfirmTarget(null); setReceiptFile(null); setReceiptError(''); }}
        className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={handleUploadReceipt}
        disabled={isUploadingReceipt || !receiptFile}
        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isUploadingReceipt ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
        ) : (
          <><Upload size={14} /> Upload Receipt</>
        )}
      </button>
    </div>
  </div>
</Modal>
```

- [ ] **Step 2: Verify in browser**

Navigate to `/dashboard/bookings`. For a booking with `payment.method === 'bank_transfer'`, `status === 'pending'`, and `payment.receiptUploaded !== true`, an amber Upload icon should appear in the action column. Clicking it opens the modal. Selecting a non-PDF is rejected. Selecting a valid PDF enables the "Upload Receipt" button. On success a toast appears and the row badge changes to "Receipt Uploaded" (purple).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/dashboard/MyBookings.jsx
git commit -m "feat: bank transfer receipt upload in My Bookings"
```

---

## Spec Coverage Self-Check

| Spec requirement | Task |
|-----------------|------|
| "Create Account" button in top-right navbar | Task 1 |
| PDF-only enforcement on document upload | Task 2 |
| Location popup shows service charge | Task 3 |
| Factory dropdown + Add New inline form + auto-select | Task 4 + 5 |
| Contact dropdown + Add New inline form + auto-select | Task 6 + 7 |
| Step data persists if user goes back | Existing (bookingStore localStorage draft) — no change |
| AQL calculates automatically | Existing — no change |
| Overview "Submit Booking Request" button | Task 8 |
| Payment step = redirect, not inline form | Task 9 |
| Bank transfer bookings show Confirm button in My Bookings | Task 11 |
| Auth guards redirect unauthenticated to login | Existing — no change |
