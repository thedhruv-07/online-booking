import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Factory, MapPin, Search, Plus } from 'lucide-react';
import { factories as mockFactories } from '../../utils/constants';
import { cn } from '../../utils/cn';

/**
 * Step 5: Factory Information
 */
const COUNTRY_CODES = [
  { code: '+86', label: '🇨🇳 +86' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+852', label: '🇭🇰 +852' },
  { code: '+84', label: '🇻🇳 +84' },
  { code: '+66', label: '🇹🇭 +66' },
  { code: '+62', label: '🇮🇩 +62' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+82', label: '🇰🇷 +82' },
];

const FactoryStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  
  const [formData, setFormData] = useState({
    name: bookingData.factory?.name || '',
    address: bookingData.factory?.location || '',
    phone: bookingData.factory?.phone?.replace(/^\+\d+\s/, '') || '',
    phonePrefix: bookingData.factory?.phone?.match(/^\+\d+/)?.[0] || '+86'
  });
  
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationError) setValidationError('');
  };

  const handleContinue = () => {
    if (!formData.name || !formData.address || !formData.phone) {
      setValidationError('Please fill in all factory details before continuing');
      return;
    }
    
    updateStepData('factory', {
      id: 'custom',
      name: formData.name,
      location: formData.address,
      phone: `${formData.phonePrefix} ${formData.phone}`
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
        <p className="text-slate-500 font-medium">Please provide the complete details of the factory where the inspection will take place.</p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center max-w-2xl mx-auto">
          {validationError}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-slate-200/40">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Manual Factory Entry</h3>
            <p className="text-sm text-slate-500 font-medium">Coordinate with their production team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Factory Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Guangzhou Manufacturing Hub"
              className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-base font-bold text-slate-800 placeholder:text-slate-300 transition-all"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number <span className="text-rose-500">*</span></label>
            <div className="flex gap-2">
              <select
                name="phonePrefix"
                value={formData.phonePrefix}
                onChange={handleChange}
                className="w-32 h-16 px-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-sm font-bold text-slate-800 transition-all"
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="XXX XXXX XXXX"
                className="flex-1 h-16 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-base font-bold text-slate-800 placeholder:text-slate-300 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Factory Full Address <span className="text-rose-500">*</span></label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter the complete building number, street, district, and city where our inspector needs to visit..."
              rows={4}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-base font-bold text-slate-800 placeholder:text-slate-300 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4 max-w-4xl mx-auto w-full">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={prevStep}
          className="h-16 px-10 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleContinue}
          className="h-16 px-12 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200"
        >
          Continue to Contact
        </Button>
      </div>
    </div>
  );
};

export default FactoryStep;
