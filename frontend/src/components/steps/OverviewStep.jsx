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
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <ClipboardCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Review & Confirm</h2>
        <p className="text-slate-500 font-medium">Please review all your booking details before final submission. Once confirmed, we will begin coordinating with the factory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">Ready to submit?</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              By confirming, you agree to our terms of service. Our team will verify the details and assign an inspector within 24 hours.
            </p>
          </div>
          <button
            onClick={nextStep}
            className="group bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl active:scale-95 shrink-0"
          >
            Confirm Booking
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-4">
        <Button 
          variant="secondary" 
          onClick={prevStep} 
          className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
        >
          Back to AQL
        </Button>
        
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Absolute Veritas Quality Assurance</p>
          <p className="text-[9px] text-slate-400">Copyright © 2024. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewStep;
