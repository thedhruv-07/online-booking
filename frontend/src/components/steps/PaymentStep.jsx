import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Building2, 
  Lock, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { PAYMENT_METHOD } from '../../utils/constants';
import { cn } from '../../utils/cn';
import { paymentService } from '../../services/payment.service';
import { toast } from 'react-hot-toast';

const PaymentStep = () => {
  const { bookingData, setPayment, prevStep, submitBooking, clearDraft } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState(bookingData.payment?.method || PAYMENT_METHOD.CARD || 'card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    const servicePrice = bookingData.service?.price || 0;
    let total = servicePrice;
    if (bookingData.files?.length > 0) {
      total += 50;
    }
    return total;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setReceipt(file);
      setError(null);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!submittedBookingId) return;
    try {
      await paymentService.downloadInvoice(submittedBookingId);
      toast.success('Invoice downloaded!');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePayment = async () => {
    setError(null);

    if (selectedMethod === PAYMENT_METHOD.BANK_TRANSFER && !receipt) {
      setError('Please upload your payment receipt for verification.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await submitBooking({
        payment: { 
          method: selectedMethod,
          receiptUploaded: !!receipt 
        }
      });

      if (result.success) {
        setSubmittedBookingId(result.booking?._id);
        setIsSuccess(true);
        toast.success('Payment successful!');
        // Keep clearDraft for later or do it now
      } else {
        setError(result.error || 'Failed to submit booking. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoPayment = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // 1. Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Submit booking first to get bookingId
      setPayment({ 
        method: 'demo',
        receiptUploaded: false 
      });
      
      const result = await submitBooking({
        payment: { 
          method: 'demo',
          receiptUploaded: false 
        }
      });

      if (result.success && result.booking?._id) {
        // 3. Trigger demo success on backend
        await paymentService.demoSuccess(result.booking._id);
        
        setSubmittedBookingId(result.booking._id);
        setIsSuccess(true);
        toast.success('Demo payment successful!');
      } else {
        setError(result.error || 'Failed to process demo booking.');
      }
    } catch (err) {
      console.error('Demo payment error:', err);
      setError(err.message || 'Demo payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 max-w-xl mx-auto space-y-8"
      >
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Payment Confirmed!</h2>
          <p className="text-slate-500 leading-relaxed">
            Thank you for your trust. Your inspection has been scheduled and our team will begin processing your request immediately.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleDownloadInvoice}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Download Invoice (PDF)
          </button>
          
          <button
            onClick={() => {
              clearDraft();
              window.location.href = '/dashboard';
            }}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-14 h-14 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <Lock size={28} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Payment Details</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Complete your booking securely. All transactions are encrypted.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left: Payment Methods & Forms */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Minimal Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
            {[
              { id: 'card', name: 'Card', icon: CreditCard },
              { id: PAYMENT_METHOD.PAYPAL, name: 'PayPal', icon: Wallet },
              { id: PAYMENT_METHOD.BANK_TRANSFER, name: 'Bank Transfer', icon: Building2 },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2",
                  selectedMethod === method.id 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                <method.icon size={16} />
                {method.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                {/* Minimal Stripe-style Card Form */}
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Card Information</label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <div className="relative border-b border-slate-200">
                        <input 
                          type="text" 
                          placeholder="Card number"
                          className="w-full h-12 pl-11 pr-4 bg-transparent outline-none font-medium placeholder:text-slate-400"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                      <div className="flex">
                        <input 
                          type="text" 
                          placeholder="MM / YY"
                          className="w-1/2 h-12 px-4 bg-transparent outline-none font-medium placeholder:text-slate-400 border-r border-slate-200"
                        />
                        <div className="relative w-1/2">
                          <input 
                            type="password" 
                            placeholder="CVC"
                            className="w-full h-12 pl-4 pr-10 bg-transparent outline-none font-medium placeholder:text-slate-400"
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Name on card</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jane Doe"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {selectedMethod === PAYMENT_METHOD.PAYPAL && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-6"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Checkout with PayPal</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Clicking "Confirm Payment" will redirect you to PayPal to securely log in and authorize the payment. You will be returned here once complete.
                  </p>
                </div>
              </motion.div>
            )}

            {selectedMethod === PAYMENT_METHOD.BANK_TRANSFER && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-6"
              >
                <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Wire Transfer Instructions</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Please transfer the exact amount to:</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Bank Name', value: 'Global Corporate Bank' },
                      { label: 'Account Name', value: 'Absolute Veritas Ltd.' },
                      { label: 'Account No.', value: '8800 1122 3344 5566' },
                      { label: 'SWIFT Code', value: 'GCB7788XXX' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Upload Transfer Receipt</h3>
                  
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden" 
                      id="receipt-upload"
                    />
                    <label 
                      htmlFor="receipt-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Plus className="text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors" size={20} />
                        <p className="text-sm font-semibold text-slate-700">
                          {receipt ? receipt.name : 'Click to browse files'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (max 5MB)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary - Light Theme */}
        <div className="xl:col-span-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Summary</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-start text-sm">
                <div className="text-slate-600">
                  <div className="font-semibold">{bookingData.service?.name}</div>
                  <div className="text-xs mt-1 opacity-80">{bookingData.product?.name}</div>
                </div>
                <div className="font-semibold text-slate-900">${bookingData.service?.price?.toFixed(2)}</div>
              </div>
              
              {bookingData.files?.length > 0 && (
                <div className="flex justify-between items-start text-sm">
                  <div className="text-slate-600 font-semibold">Additional Processing</div>
                  <div className="font-semibold text-slate-900">$50.00</div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-black text-slate-900">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={cn(
                "btn-primary w-full flex items-center justify-center gap-2",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay & Complete Booking
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Demo Payment Button */}
            <button
              onClick={handleDemoPayment}
              disabled={isProcessing}
              className="btn-secondary w-full mt-3 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Skip with Demo Payment
                </>
              )}
            </button>

            <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Lock size={12} />
              <span>Payments are secure and encrypted.</span>
            </div>
          </div>

          <button
            onClick={prevStep}
            className="btn-secondary w-full mt-6 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to previous step
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-start gap-3 mt-8 max-w-2xl"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Payment Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentStep;
