import { useState, useEffect } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { getCountries, getStatesByCountry } from '../../utils/geoData';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Navigation, Mail } from 'lucide-react';

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
      // Reset city/state if it's not in the new country's list
      if (states.length > 0 && !states.find(s => s.id === formData.city)) {
        // We don't reset if it was already set from bookingData and is valid
      }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStepData('location', formData);
    nextStep();
  };

  const countries = getCountries();

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <MapPin size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Location Details</h2>
        <p className="text-slate-500 font-medium">Specify where the inspection will take place. This helps us assign the nearest certified inspector.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="h-14 rounded-2xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
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
              className="h-14 rounded-2xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
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
              className="h-14 rounded-2xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
            />
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={prevStep}
            className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 order-2 sm:order-1"
          >
            Back
          </Button>
          <Button 
            type="submit"
            className="h-14 px-10 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 order-1 sm:order-2"
          >
            Continue to Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LocationStep;
