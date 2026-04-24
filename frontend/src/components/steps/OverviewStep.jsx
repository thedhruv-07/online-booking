import React, { useMemo } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { 
  ClipboardCheck, 
  MapPin, 
  Package, 
  Factory, 
  User, 
  Calendar, 
  Hash,
  Shield,
  CheckSquare
} from 'lucide-react';
import { StepNavigation } from '../booking';

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
        <div className="mx-auto w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
          <ClipboardCheck size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight uppercase">Review & Confirm</h2>
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

        {/* AQL Configuration Card */}
        <SummaryCard 
          title="Quality Standards" 
          icon={Shield} 
          color={{ bg: 'bg-indigo-50/50', text: 'text-indigo-600' }}
        >
          <DetailItem label="Total Lot Size" value={`${bookingData.aql?.lotSize?.toLocaleString() || 0} Units`} />
          <DetailItem label="Strictness" value={<span className="capitalize">{bookingData.aql?.strictnessMode || 'Standard'}</span>} />
          <DetailItem label="Quality Level" value={<span className="capitalize">{bookingData.aql?.qualityMode || 'Standard'} Quality</span>} />
          
          <div className="bg-white border border-indigo-100 rounded-lg p-4 mt-4 shadow-sm">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Total Sample Size</span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center shrink-0">
                <CheckSquare size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-600">{bookingData.aql?.sampleSize || 0}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Units</span>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100">
              The inspector will thoroughly check this sample from your lot.
            </p>
          </div>
        </SummaryCard>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4">
              <Shield size={12} />
              Verified Protocol
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Ready to initiate inspection?</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              By confirming, you authorize Absolute Veritas to begin coordinating with the factory.
            </p>
          </div>
      <StepNavigation 
        onBack={prevStep}
        onNext={nextStep}
        nextLabel="Confirm & Proceed"
      />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Absolute Veritas Global Quality Control</p>
        <p className="text-[9px] text-slate-300 font-bold">Copyright © 2024. Standard Inspection Terms Apply.</p>
      </div>
    </div>
  );
};

export default OverviewStep;
