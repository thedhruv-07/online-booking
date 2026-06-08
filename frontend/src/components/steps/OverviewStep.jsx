import React, { useMemo, useState } from 'react';
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
  CheckSquare,
  Loader2
} from 'lucide-react';
import { StepNavigation } from '../booking';

const OverviewStep = () => {
  const { bookingData, prevStep, nextStep, submitBooking, setPayment } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
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
    } catch {
      setSubmitError('Failed to submit booking. Please try again.');
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto w-16 h-16 bg-slate-900 text-white rounded-[16px] flex items-center justify-center mb-8 shadow-xl">
          <ClipboardCheck size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight uppercase">Review & Confirm</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verify your booking parameters</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Product & Service */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
            <Package className="text-slate-400" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Product & Service</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Booking ID</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{systemIds.avId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Service Type</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.service?.name || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Product Name</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.product?.name || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Quantity</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{`${bookingData.product?.quantity || 0} ${bookingData.product?.unitType || 'Units'}`}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Inspection Date</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.product?.inspectionDate || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
          </div>
        </div>

        {/* Factory Details */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
            <Factory className="text-slate-400" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Factory Details</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Factory Name</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.factory?.name || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Location</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">
                {bookingData.location?.city ? `${bookingData.location.city}, ${bookingData.location.country}` : <span className="text-slate-300 italic">Not specified</span>}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Address</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.factory?.location || bookingData.location?.address || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Factory ID</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{systemIds.factoryId}</span>
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
            <User className="text-slate-400" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Contact Person</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Contact Name</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.contact?.name || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Email Address</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.contact?.email || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Phone Number</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.contact?.phone || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Designation</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{bookingData.contact?.designation || <span className="text-slate-300 italic">Not specified</span>}</span>
            </div>
          </div>
        </div>

        {/* Quality Standards */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
            <Shield className="text-slate-400" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Quality Standards</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Total Lot Size</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right">{`${bookingData.aql?.lotSize?.toLocaleString() || 0} Units`}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Strictness</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right capitalize">{bookingData.aql?.strictnessMode || 'Standard'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-2">
              <span className="text-sm font-medium text-slate-500 sm:w-1/3">Quality Level</span>
              <span className="text-sm font-semibold text-slate-900 sm:w-2/3 sm:text-right capitalize">{bookingData.aql?.qualityMode || 'Standard'} Quality</span>
            </div>
            <div className="bg-orange-50/50 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-av-orange text-white rounded-lg flex items-center justify-center shrink-0">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-av-orange uppercase tracking-widest block leading-none mb-1">Total Sample Size</span>
                  <p className="text-xs font-medium text-slate-600">This is the number of units to be checked.</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-av-orange">{bookingData.aql?.sampleSize || 0}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Units</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-6">
          <Shield size={12} className="text-av-orange" />
          Verified Protocol
        </div>

        <h3 className="text-2xl font-bold mb-3 text-slate-900 tracking-tight">Ready to Submit?</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
          By submitting, you authorise Absolute Veritas to begin coordinating with your factory. You will be directed to the payment portal next.
        </p>

        {submitError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold w-full">
            {submitError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={prevStep}
            type="button"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
            className="w-full sm:w-auto bg-av-orange hover:bg-av-orange-hover text-white px-8 py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Booking Request'
            )}
          </button>
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
