import React, { useMemo } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Button from '../ui/Button';
import { 
  ClipboardCheck, 
  MapPin, 
  Package, 
  Factory, 
  User, 
  Calendar, 
  Hash,
  Shield,
  ArrowRight
} from 'lucide-react';

const OverviewStep = () => {
  const { bookingData, prevStep, nextStep } = useBooking();

  // Generate real-looking system IDs once per component mount or when bookingData changes
  const systemIds = useMemo(() => {
    const seed = bookingData.product?.name || 'default';
    const hash = (str) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      return Math.abs(h).toString(16);
    };
    
    return {
      avId: `AV-${hash(seed + 'av').padEnd(12, '0').slice(0, 12)}`,
      productId: `AV-P-${hash(seed + 'prod').padEnd(12, '0').slice(0, 12)}`,
      factoryId: `AV-F-${hash((bookingData.factory?.name || 'fact') + 'f').padEnd(12, '0').slice(0, 12)}`,
      factoryContactId: `AV-C-${hash((bookingData.contact?.name || 'cont') + 'c').padEnd(12, '0').slice(0, 12)}`,
    };
  }, [bookingData.product?.name, bookingData.factory?.name, bookingData.contact?.name]);

  const SummaryCard = ({ title, icon: Icon, color, children }) => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className={`px-6 py-4 border-b border-slate-50 flex items-center gap-3 ${color.bg}`}>
        <div className={`p-2 rounded-xl bg-white shadow-sm ${color.text}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-6 space-y-4 flex-1">
        {children}
      </div>
    </div>
  );

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon size={10} />}
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700 break-words">
        {value || <span className="text-slate-300 italic">Not specified</span>}
      </span>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200">
          <ClipboardCheck size={40} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase">Review & Confirm</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verify your booking parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Service & Product Card */}
        <SummaryCard 
          title="Product & Service" 
          icon={Package} 
          color={{ bg: 'bg-orange-50/50', text: 'text-orange-600' }}
        >
          <DetailItem label="Booking ID" value={systemIds.avId} icon={Hash} />
          <DetailItem label="Service Type" value={bookingData.service?.name} icon={Shield} />
          <DetailItem label="Product Name" value={bookingData.product?.name} />
          <DetailItem label="Quantity" value={`${bookingData.product?.quantity} ${bookingData.product?.unitType}`} />
          <DetailItem label="Inspection Date" value={bookingData.product?.inspectionDate} icon={Calendar} />
        </SummaryCard>

        {/* Location & Factory Card */}
        <SummaryCard 
          title="Factory Details" 
          icon={Factory} 
          color={{ bg: 'bg-indigo-50/50', text: 'text-indigo-600' }}
        >
          <DetailItem label="Factory Name" value={bookingData.factory?.name} />
          <DetailItem label="Location" value={`${bookingData.location?.city}, ${bookingData.location?.country}`} icon={MapPin} />
          <DetailItem label="Address" value={bookingData.factory?.location || bookingData.location?.address} />
          <DetailItem label="Factory ID" value={systemIds.factoryId} icon={Hash} />
        </SummaryCard>

        {/* Contact Details Card */}
        <SummaryCard 
          title="Contact Person" 
          icon={User} 
          color={{ bg: 'bg-blue-50/50', text: 'text-blue-600' }}
        >
          <DetailItem label="Contact Name" value={bookingData.contact?.name} />
          <DetailItem label="Email ID" value={bookingData.contact?.email} />
          <DetailItem label="Phone Number" value={bookingData.contact?.phone} />
          <DetailItem label="Designation" value={bookingData.contact?.designation} />
          <DetailItem label="Contact ID" value={systemIds.factoryContactId} icon={Hash} />
        </SummaryCard>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">
              <Shield size={12} />
              Verified Protocol
            </div>
            <h3 className="text-3xl font-black mb-4 tracking-tight">Ready to initiate inspection?</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              By confirming, you authorize Absolute Veritas to begin coordinating with the factory. Our team will assign a certified inspector within the next 24 business hours.
            </p>
          </div>
          <button
            onClick={nextStep}
            className="group bg-indigo-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all flex items-center gap-4 shadow-2xl shadow-indigo-500/20 active:scale-95 shrink-0"
          >
            Confirm & Proceed
            <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pt-6">
        <button 
          onClick={prevStep} 
          className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-2 border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 transition-all flex items-center gap-3"
        >
          <ArrowRight className="rotate-180" size={16} />
          Back to parameters
        </button>
        
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Absolute Veritas Global Quality Control</p>
          <p className="text-[9px] text-slate-300 font-bold">Copyright © 2024. Standard Inspection Terms Apply.</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewStep;
