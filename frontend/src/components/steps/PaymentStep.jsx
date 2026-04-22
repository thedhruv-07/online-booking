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
  Plus
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { PAYMENT_METHOD } from '../../utils/constants';
import { cn } from '../../utils/cn';

const PaymentStep = () => {
  const { bookingData, setPayment, prevStep, submitBooking } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState(bookingData.payment?.method || PAYMENT_METHOD.CARD || 'card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    const servicePrice = bookingData.service?.price || 0;
    let total = servicePrice;
    if (bookingData.files?.length > 0) {
      total += 50;
    }
    return total;
  };

  const handlePayment = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      setPayment({ method: selectedMethod });
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
        <h2 className="text-3xl font-black text-slate-900 mb-2">Secure Checkout</h2>
        <p className="text-slate-500 font-medium">Finalize your inspection request with our secure payment gateway. Your data is protected with 256-bit SSL encryption.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left: Payment Methods & Forms */}
        <div className="xl:col-span-8 space-y-10">
          <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
            {[
              { id: 'card', name: 'Credit Card', icon: CreditCard },
              { id: PAYMENT_METHOD.PAYPAL, name: 'PayPal', icon: Wallet },
              { id: PAYMENT_METHOD.BANK_TRANSFER, name: 'Bank Transfer', icon: Building2 },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                  selectedMethod === method.id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Mock Credit Card */}
                <div className="relative h-56 w-96 group perspective-1000">
                  <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-12 h-10 bg-gradient-to-br from-amber-400 to-amber-200 rounded-lg shadow-inner"></div>
                        <Globe className="text-white/20" size={32} />
                      </div>
                      <div className="relative z-10">
                        <div className="text-2xl font-mono tracking-[0.25em] mb-4">**** **** **** 4242</div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Card Holder</div>
                            <div className="text-sm font-bold uppercase tracking-wider italic">ABSOLUTE VERITAS</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Expires</div>
                            <div className="text-sm font-bold">12 / 26</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono text-lg"
                      />
                      <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Card Holder Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM / YY"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CVV Code</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        placeholder="***"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                      />
                      <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
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
                className="p-10 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-blue-600">
                  <Wallet size={40} />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Redirect to PayPal</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You'll be securely redirected to PayPal's portal to complete your payment. All your information remains encrypted.
                  </p>
                </div>
              </motion.div>
            )}

            {selectedMethod === PAYMENT_METHOD.BANK_TRANSFER && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-10 bg-slate-50 rounded-[2rem] border border-slate-200"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-slate-700">
                    <Building2 size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Corporate Bank Account</h3>
                    <p className="text-slate-500 text-sm">Direct transfer details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Bank Name', value: 'Global Corporate Bank' },
                    { label: 'Account Holder', value: 'Absolute Veritas Ltd.' },
                    { label: 'Account Number', value: '8800 1122 3344 5566' },
                    { label: 'SWIFT / BIC', value: 'GCB7788XXX' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-sm font-bold text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary */}
        <div className="xl:col-span-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold">Order Summary</h3>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">Preview</div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-slate-200">{bookingData.service?.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{bookingData.product?.name}</div>
                </div>
                <div className="font-mono text-sm">${bookingData.service?.price?.toFixed(2)}</div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="text-sm font-bold text-slate-200">Additional Processing</div>
                <div className="font-mono text-sm">${bookingData.files?.length > 0 ? '50.00' : '0.00'}</div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Total Amount</span>
                  <span className="text-4xl font-black">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={cn(
                "w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95",
                isProcessing 
                  ? "bg-white/10 text-white/30 cursor-not-allowed" 
                  : "bg-white text-slate-900 hover:bg-slate-100"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Pay Now
                  <CheckCircle2 size={20} />
                </>
              )}
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-500">
                <Lock size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Guaranteed Assurance</span>
              </div>
            </div>
          </div>

          <button
            onClick={prevStep}
            className="w-full mt-6 h-14 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Modify Booking
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 flex items-start gap-4"
          >
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payment Error</p>
              <p className="text-sm font-medium mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentStep;
