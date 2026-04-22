import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Globe,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { PAYMENT_METHOD } from '../../utils/constants';
import { cn } from '../../utils/cn';

const PaymentStep = () => {
  const { bookingData, setPayment, prevStep, submitBooking } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState(bookingData.payment?.method || PAYMENT_METHOD.CARD || 'card');
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handlePayment = async () => {
    setError(null);

    if (selectedMethod === PAYMENT_METHOD.BANK_TRANSFER && !receipt) {
      setError('Please upload your payment receipt for verification.');
      return;
    }

    setIsProcessing(true);

    try {
      setPayment({ 
        method: selectedMethod,
        receiptUploaded: !!receipt 
      });
      
      const result = await submitBooking();

      if (result.success) {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit booking. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">Payment Confirmation</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Your Payment Details</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left: Payment Methods & Forms */}
        <div className="xl:col-span-8 space-y-10">
          <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-fit">
            {[
              { id: 'card', name: 'Credit Card', icon: CreditCard },
              { id: PAYMENT_METHOD.PAYPAL, name: 'PayPal', icon: Wallet },
              { id: PAYMENT_METHOD.BANK_TRANSFER, name: 'Bank Transfer', icon: Building2 },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                  selectedMethod === method.id 
                    ? "bg-white text-slate-900 shadow-xl" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <method.icon size={16} strokeWidth={2.5} />
                {method.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                {/* Mock Credit Card */}
                <div className="relative h-60 w-full max-w-[440px] group perspective-1000 mx-auto md:mx-0">
                  <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -mr-40 -mt-40"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-14 h-11 bg-gradient-to-br from-amber-400 to-amber-200 rounded-xl shadow-inner border border-white/10"></div>
                        <ShieldCheck className="text-white/20" size={36} />
                      </div>
                      <div className="relative z-10">
                        <div className="text-2xl font-mono tracking-[0.25em] mb-6 drop-shadow-lg">**** **** **** 4242</div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2">Card Holder</div>
                            <div className="text-sm font-black uppercase tracking-widest italic">Absolute Veritas</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-2">Expires</div>
                            <div className="text-sm font-black">12 / 26</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Card Number</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all font-mono text-xl outline-none"
                      />
                      <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Card Holder Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM / YY"
                      className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">CVV Code</label>
                    <div className="relative group">
                      <input 
                        type="password" 
                        placeholder="***"
                        className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold outline-none"
                      />
                      <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedMethod === PAYMENT_METHOD.PAYPAL && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-12 bg-indigo-50/30 rounded-[2.5rem] border-2 border-indigo-50 flex flex-col items-center text-center space-y-8"
              >
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl text-indigo-600">
                  <Wallet size={48} strokeWidth={2.5} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-2xl font-black text-slate-900 mb-3">Redirect to PayPal</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    You'll be securely redirected to PayPal's portal to complete your payment. All your information remains encrypted and protected.
                  </p>
                </div>
              </motion.div>
            )}

            {selectedMethod === PAYMENT_METHOD.BANK_TRANSFER && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl text-slate-900">
                      <Building2 size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Corporate Bank Account</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Direct transfer details</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: 'Bank Name', value: 'Global Corporate Bank' },
                      { label: 'Account Holder', value: 'Absolute Veritas Ltd.' },
                      { label: 'Account Number', value: '8800 1122 3344 5566' },
                      { label: 'SWIFT / BIC', value: 'GCB7788XXX' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">{item.label}</div>
                        <div className="text-sm font-black text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Section: Payment Receipt Upload */}
                <div className="p-10 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Payment Receipt</h3>
                  </div>

                  <div className="space-y-6">
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
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-indigo-500 transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                            <Plus className="text-slate-400 group-hover:text-indigo-600" size={24} />
                          </div>
                          <p className="mb-1 text-sm font-black text-slate-600">
                            {receipt ? receipt.name : 'Choose File No file chosen'}
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Upload Receipt Now
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-start gap-3 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
                        Note: Only .pdf, .jpg and .png formats allowed to a max size of 5 MB.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary */}
        <div className="xl:col-span-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl sticky top-8 border border-white/10">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-xl font-black tracking-tight">Order Summary</h3>
              <div className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Secure Protocol</div>
            </div>

            <div className="space-y-8 mb-12">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-black text-slate-200">{bookingData.service?.name}</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">{bookingData.product?.name}</div>
                </div>
                <div className="font-mono text-sm font-bold text-indigo-400">${bookingData.service?.price?.toFixed(2)}</div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="text-sm font-black text-slate-200">Additional Processing</div>
                <div className="font-mono text-sm font-bold text-indigo-400">${bookingData.files?.length > 0 ? '50.00' : '0.00'}</div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Total Amount</span>
                  <span className="text-5xl font-black tracking-tighter">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={cn(
                "w-full h-18 py-5 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95",
                isProcessing 
                  ? "bg-white/10 text-white/30 cursor-not-allowed" 
                  : "bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02]"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <>
                  Confirm Payment
                  <ArrowRight size={22} strokeWidth={3} />
                </>
              )}
            </button>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-4 text-slate-500">
                <Lock size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <ShieldCheck size={16} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quality Assurance Guaranteed</span>
              </div>
            </div>
          </div>

          <button
            onClick={prevStep}
            className="w-full mt-8 h-16 rounded-[1.5rem] border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200 transition-all flex items-center justify-center gap-3 group"
          >
            <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            Modify Parameters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] text-rose-600 flex items-start gap-5 shadow-xl shadow-rose-100/50"
          >
            <AlertCircle className="w-7 h-7 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-lg tracking-tight">Security Alert</p>
              <p className="text-sm font-bold mt-1 opacity-80 uppercase tracking-widest">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentStep;
