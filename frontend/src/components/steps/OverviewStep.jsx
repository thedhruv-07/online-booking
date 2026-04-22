import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  Package, 
  FileText, 
  Factory, 
  User, 
  Settings2,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Info
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { cn } from '../../utils/cn';

const OverviewStep = () => {
  const { bookingData, prevStep, nextStep, setOverview } = useBooking();

  const calculateTotal = () => {
    const servicePrice = bookingData.service?.price || 0;
    let total = servicePrice;
    if (bookingData.files?.length > 0) {
      total += 50; // Processing fee
    }
    return total;
  };

  const handleConfirm = () => {
    const summary = {
      totalAmount: calculateTotal(),
      itemCount: 1,
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setOverview(summary);
    nextStep();
  };

  const SummaryCard = ({ title, icon: Icon, children, stepNumber }) => (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 group hover:bg-white hover:border-indigo-100 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-0.5">Step {stepNumber}</span>
          <h4 className="font-bold text-slate-800 leading-none">{title}</h4>
        </div>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-700 font-bold text-right">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Your Booking</h2>
        <p className="text-slate-500 font-medium">Please double check all the information below before proceeding to secure payment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard title="Service Selection" icon={ShieldCheck} stepNumber={1}>
          <InfoRow label="Type" value={bookingData.service?.name} />
          <InfoRow label="Base Price" value={`$${bookingData.service?.price?.toFixed(2)}`} />
        </SummaryCard>

        <SummaryCard title="Location Details" icon={MapPin} stepNumber={2}>
          <InfoRow label="Address" value={bookingData.location?.address} />
          <InfoRow label="City" value={bookingData.location?.city} />
          <InfoRow label="Country" value={bookingData.location?.country} />
        </SummaryCard>

        <SummaryCard title="Product Info" icon={Package} stepNumber={3}>
          <InfoRow label="Product" value={bookingData.product?.name} />
          <InfoRow label="Category" value={bookingData.product?.category} />
        </SummaryCard>

        <SummaryCard title="Documents" icon={FileText} stepNumber={4}>
          <InfoRow label="Files" value={bookingData.files?.length > 0 ? `${bookingData.files.length} Files` : 'None'} />
          {bookingData.files?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bookingData.files.slice(0, 3).map(f => (
                <span key={f.id} className="text-[10px] bg-white px-2 py-1 rounded-md border border-slate-100 font-bold text-slate-500">{f.name.slice(0, 10)}...</span>
              ))}
            </div>
          )}
        </SummaryCard>

        <SummaryCard title="Factory Info" icon={Factory} stepNumber={5}>
          <InfoRow label="Name" value={bookingData.factory?.name} />
          <InfoRow label="Location" value={bookingData.factory?.location} />
        </SummaryCard>

        <SummaryCard title="Contact Person" icon={User} stepNumber={6}>
          <InfoRow label="Name" value={bookingData.contact?.name} />
          <InfoRow label="Email" value={bookingData.contact?.email} />
          <InfoRow label="Phone" value={bookingData.contact?.phone} />
        </SummaryCard>
      </div>

      {/* Summary Footer */}
      <div className="mt-10 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <CreditCard size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Order Summary</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">${calculateTotal().toFixed(2)}</span>
                <span className="text-slate-400 font-medium">USD</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">Includes all service fees and taxes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={prevStep}
              className="px-6 py-4 rounded-2xl font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button 
              onClick={handleConfirm}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-slate-950/20"
            >
              Secure Checkout
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400">
            <Info size={16} />
          </div>
          <p className="text-xs text-slate-400 font-medium">
            By clicking "Secure Checkout", you agree to our Terms of Service and Privacy Policy. Final price may vary based on actual inspection duration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewStep;
