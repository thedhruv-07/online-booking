import { CheckCircle2, ExternalLink, ArrowRight, Hash } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useNavigate } from 'react-router-dom';

const PaymentStep = () => {
  const { bookingData, clearDraft } = useBooking();
  const navigate = useNavigate();

  const bookingId = bookingData.payment?.bookingId;
  const totalAmount = bookingData.payment?.totalAmount ?? bookingData.service?.totalAmount ?? 0;
  const serviceName = bookingData.payment?.serviceName || bookingData.service?.name || 'Inspection Service';
  const shortId = bookingId ? `#${bookingId.slice(-8).toUpperCase()}` : '—';

  const handleViewBookings = () => {
    clearDraft();
    navigate('/dashboard/bookings');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 space-y-10 max-w-xl mx-auto text-center">
      {/* Success icon */}
      <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shadow-sm">
        <CheckCircle2 size={52} className="text-emerald-500" />
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Submitted!</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Your inspection request has been received. Complete your payment on the next page to confirm.
        </p>
      </div>

      {/* Booking summary */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Hash size={12} /> Booking Reference
          </span>
          <span className="font-black text-indigo-600 text-lg">{shortId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Service</span>
          <span className="text-sm font-bold text-slate-800">{serviceName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Amount Due</span>
          <span className="text-xl font-black text-slate-900">${Number(totalAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left">
        <p className="text-sm font-bold text-amber-800 mb-2">How to complete payment:</p>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal ml-4 font-medium">
          <li>Click <strong>"Proceed to Payment"</strong> below</li>
          <li>
            Enter <strong>{shortId}</strong> in the{' '}
            <em>Invoice No. / Project Reference</em> field
          </li>
          <li>
            Enter amount: <strong>${Number(totalAmount).toFixed(2)}</strong>
          </li>
          <li>Pay via Razorpay, UPI, or Bank Transfer</li>
        </ol>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        <a
          href="https://absoluteveritas.com/online_payment.php"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Proceed to Payment
          <ExternalLink size={18} />
        </a>
        <button
          onClick={handleViewBookings}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          View My Bookings
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-xs text-slate-400 font-medium">
        Questions? Contact{' '}
        <span className="text-indigo-500">finance@absoluteveritas.com</span>
      </p>
    </div>
  );
};

export default PaymentStep;
