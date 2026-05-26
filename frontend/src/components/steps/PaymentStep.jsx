import { useState } from 'react';
import { ExternalLink, ArrowRight, ArrowLeft, Hash, Building2, CreditCard, Upload } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/payment.service';
import { bookingService } from '../../services/booking.service';

const BANK_DETAILS = [
  { label: 'Beneficiary',   value: 'Absolute Veritas' },
  { label: 'Account No.',   value: '50200037111753' },
  { label: 'IFSC Code',     value: 'HDFC0000093' },
  { label: 'Bank',          value: 'HDFC Bank' },
  { label: 'SWIFT',         value: 'HDFCINBB' },
  { label: 'Branch',        value: 'HDFC Bank, NIT-5 Faridabad' },
];

const PaymentStep = () => {
  const { bookingData, clearDraft } = useBooking();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState(null); // 'razorpay' | 'bank_transfer'
  const [stage, setStage] = useState('select');             // 'select' | 'details' | 'upload'
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const bookingId    = bookingData.payment?.bookingId;
  const totalAmount  = bookingData.payment?.totalAmount ?? bookingData.service?.totalAmount ?? 0;
  const serviceName  = bookingData.payment?.serviceName || bookingData.service?.name || 'Inspection Service';
  const shortId      = bookingId ? `#${bookingId.slice(-8).toUpperCase()}` : '—';

  const finishAndNavigate = () => {
    clearDraft();
    navigate('/dashboard/bookings');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setUploadError('Please upload a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10 MB.');
      return;
    }
    setReceiptFile(file);
    setUploadError('');
  };

  const handleUploadAndFinish = async () => {
    setIsUploading(true);
    setUploadError('');
    try {
      await paymentService.uploadBankReceipt(bookingId, receiptFile, paymentMethod);
      finishAndNavigate();
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleSkipAndFinish = async () => {
    try {
      await bookingService.updateBooking(bookingId, {
        payment: { method: 'razorpay', status: 'pending' },
      });
    } catch (err) {
      console.error('Failed to update booking payment method:', err.message);
    }
    finishAndNavigate();
  };

  // ─── Stage: select ────────────────────────────────────────────────────────
  if (stage === 'select') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 space-y-8 max-w-xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Payment Method</h2>
          <p className="text-slate-500 font-medium">How would you like to pay?</p>
        </div>

        <div className="w-full space-y-4">
          {/* Pay Online */}
          <button
            onClick={() => { setPaymentMethod('razorpay'); setStage('details'); }}
            className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <CreditCard size={24} className="text-indigo-600" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">Pay Online</div>
                <div className="text-sm text-slate-500 font-medium">Razorpay / UPI / Net Banking / Card</div>
              </div>
              <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => { setPaymentMethod('bank_transfer'); setStage('details'); }}
            className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Building2 size={24} className="text-emerald-600" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">Bank Transfer</div>
                <div className="text-sm text-slate-500 font-medium">Direct transfer with receipt upload</div>
              </div>
              <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ─── Stage: details ───────────────────────────────────────────────────────
  if (stage === 'details') {
    return (
      <div className="flex flex-col items-center min-h-[60vh] py-16 space-y-8 max-w-xl mx-auto">
        {/* Back */}
        <button
          onClick={() => setStage('select')}
          className="self-start flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Booking summary */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
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

        {/* Razorpay details */}
        {paymentMethod === 'razorpay' && (
          <>
            <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-amber-800 mb-2">How to complete payment:</p>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal ml-4 font-medium">
                <li>Click <strong>"Proceed to Payment"</strong> below</li>
                <li>Enter <strong>{shortId}</strong> in the <em>Invoice No. / Project Reference</em> field</li>
                <li>Enter amount: <strong>${Number(totalAmount).toFixed(2)}</strong></li>
                <li>Pay via Razorpay, UPI, or Net Banking</li>
              </ol>
            </div>
            <div className="w-full space-y-3">
              <a
                href="https://absoluteveritas.com/online_payment.php"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Proceed to Payment <ExternalLink size={18} />
              </a>
              <button
                onClick={() => setStage('upload')}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                I've completed payment <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Bank transfer details */}
        {paymentMethod === 'bank_transfer' && (
          <>
            <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Details</p>
              {BANK_DETAILS.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{label}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStage('upload')}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              I've transferred the payment <ArrowRight size={18} />
            </button>
          </>
        )}

        <p className="text-xs text-slate-400 font-medium">
          Questions? Contact <span className="text-indigo-500">finance@absoluteveritas.com</span>
        </p>
      </div>
    );
  }

  // ─── Stage: upload ────────────────────────────────────────────────────────
  if (stage === 'upload') {
    const isRequired = paymentMethod === 'bank_transfer';
    return (
      <div className="flex flex-col items-center min-h-[60vh] py-16 space-y-8 max-w-xl mx-auto text-center">
        {/* Back */}
        <button
          onClick={() => { setReceiptFile(null); setUploadError(''); setStage('details'); }}
          className="self-start flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRequired ? 'Upload Bank Transfer Receipt' : 'Upload Payment Receipt'}
          </h2>
          {!isRequired && (
            <p className="text-slate-500 font-medium">
              Optional but recommended — helps us confirm your payment faster.
            </p>
          )}
        </div>

        <div className="w-full">
          <input
            type="file"
            id="receipt-upload-input"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="receipt-upload-input"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all"
          >
            <Upload size={24} className="text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {receiptFile ? receiptFile.name : 'Click to select file'}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG — max 10 MB</p>
          </label>
        </div>

        {uploadError && (
          <p className="text-rose-600 text-sm font-bold">{uploadError}</p>
        )}

        <div className="w-full space-y-3">
          <button
            onClick={handleUploadAndFinish}
            disabled={isUploading || !receiptFile}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} /> Upload &amp; Finish
              </>
            )}
          </button>

          {!isRequired && (
            <button
              onClick={handleSkipAndFinish}
              disabled={isUploading}
              className="text-sm text-slate-400 hover:text-slate-600 font-bold transition-colors disabled:opacity-50"
            >
              Skip &amp; Finish
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStep;
