import { useState, useEffect } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { Input, Select } from '../ui';
import { getCountries, getStatesByCountry } from '../../utils/geoData';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Navigation, Mail } from 'lucide-react';
import { StepNavigation } from '../booking';

/**
 * Step 2: Location Information (Upgraded with Dependent Selects)
 */
const LocationStep = () => {
  const { updateStepData, bookingData, nextStep, prevStep } = useBooking();
  const [formData, setFormData] = useState({
    country: bookingData.location?.country || '',
    city: bookingData.location?.city || '',
    address: bookingData.location?.address || '',
    postalCode: bookingData.location?.postalCode || '',
  });

  const [availableStates, setAvailableStates] = useState([]);

  // Update states whenever country changes
  useEffect(() => {
    if (formData.country) {
      const states = getStatesByCountry(formData.country);
      setAvailableStates(states);
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // If country changes, reset city
      ...(name === 'country' ? { city: '' } : {})
    }));
  };

  const handleContinue = () => {
    updateStepData('location', formData);
    nextStep();
  };

  const countries = getCountries();

  const isFormValid = formData.country && formData.city && formData.address && formData.postalCode;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <MapPin size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Location Details</h2>
        <p className="text-slate-500 font-medium">Specify where the inspection will take place. This helps us assign the nearest certified inspector.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Selection */}
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
              className="rounded-md border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
            />
          </div>

          {/* Dynamic State/City Selection */}
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
                placeholder={formData.country ? "Select State" : "Select Country First"}
                disabled={!formData.country}
                required
                className="h-14 rounded-2xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </motion.div>
          </AnimatePresence>

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
              className="rounded-md border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
            />
          </div>

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
              className="rounded-md border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
            />
          </div>
        </div>

        <StepNavigation 
          onBack={prevStep}
          onNext={handleContinue}
          isValid={isFormValid}
          nextLabel="Continue to Product"
        />
      </div>
    </div>
  );
};

export default LocationStep;
