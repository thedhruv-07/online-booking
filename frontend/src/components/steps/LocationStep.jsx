import { useState, useEffect, useRef } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { Input, Select, Modal } from '../ui';
import { getCountries, getStatesByCountry } from '../../utils/geoData';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Navigation, Mail } from 'lucide-react';
import { StepNavigation } from '../booking';
import { cn } from '../../utils/cn';

import { calculateFinalPrice, services as allServices } from '@shared/pricing';

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
