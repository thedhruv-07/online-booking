import { useState, useEffect } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { useAuth } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { User, Mail, Phone, Briefcase, Users, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Step 6: Contact Person Information
 */
const ContactStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: bookingData.contact?.name || '',
    email: bookingData.contact?.email || '',
    phone: bookingData.contact?.phone || '',
    designation: bookingData.contact?.designation || '',
  });

  const [useProfile, setUseProfile] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle profile toggle
  useEffect(() => {
    if (useProfile && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || 'Client Contact',
      });
    }
  }, [useProfile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationError) setValidationError('');
    if (useProfile) setUseProfile(false); // Disable toggle if user edits manually
  };

  const handleContinue = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.designation) {
      setValidationError('Please fill in all mandatory fields');
      return;
    }

    updateStepData('contact', formData);
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Users size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Factory Contact</h2>
        <p className="text-slate-500 font-medium">Who should we contact at the factory? Our inspector will reach out to this person to confirm the visit and logistical details.</p>
      </div>

      {/* Profile Toggle */}
      <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between mb-8 group hover:border-blue-200 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Use my profile details</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Auto-fill from your account</p>
          </div>
        </div>
        
        <button 
          onClick={() => setUseProfile(!useProfile)}
          className={cn(
            "w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner",
            useProfile ? "bg-blue-600 shadow-blue-200" : "bg-slate-200"
          )}
        >
          <div className={cn(
            "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300",
            useProfile ? "translate-x-6" : "translate-x-0"
          )}>
            {useProfile && <Check size={14} className="text-blue-600" strokeWidth={3} />}
          </div>
        </button>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium text-center">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <User size={14} className="text-blue-500" />
            Contact Person Name <span className="text-rose-500">*</span>
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Contact Name ..."
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Mail size={14} className="text-blue-500" />
            Contact Email ID <span className="text-rose-500">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email Address ..."
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Phone size={14} className="text-blue-500" />
            Contact Phone Number <span className="text-rose-500">*</span>
          </label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter Phone Number ..."
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Contact Designation */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Briefcase size={14} className="text-blue-500" />
            Contact Designation <span className="text-rose-500">*</span>
          </label>
          <Input
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g. Factory Manager"
            required
            className="h-14 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={prevStep}
          className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleContinue}
          className="h-14 px-10 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 shadow-lg"
        >
          Continue to AQL
        </Button>
      </div>
    </div>
  );
};

export default ContactStep;
