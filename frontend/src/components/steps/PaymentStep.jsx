import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { PAYMENT_METHOD } from '../../utils/constants';
import { cn } from '../../utils/cn';

const PaymentStep = () => {
  const { bookingData, setPayment, prevStep, submitBooking } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState(bookingData.payment?.method || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { 
      id: PAYMENT_METHOD.PAYPAL, 
      name: 'PayPal', 
      icon: Wallet, 
      description: 'Pay via PayPal or Credit Card securely.',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      id: PAYMENT_METHOD.BANK_TRANSFER, 
      name: 'Bank Transfer', 
      icon: Building2, 
      description: 'Direct wire transfer to our corporate account.',
      color: 'text-slate-600',
      bg: 'bg-slate-50'
    },
  ];

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
        if (selectedMethod === PAYMENT_METHOD.PAYPAL) {
          window.location.href = `/payment/paypal/${result.booking.id}`;
        } else {
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
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
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Finalize & Pay</h2>
        <p className="text-slate-500 font-medium">Choose your payment method to complete the booking. All transactions are encrypted and secure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Options */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</h3>
          <div className="grid grid-cols-1 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <motion.div
                  key={method.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4",
                    isSelected 
                      ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    isSelected ? "bg-indigo-600 text-white" : cn(method.bg, method.color)
                  )}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{method.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{method.description}</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-200"
                  )}>
                    {isSelected && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedMethod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 mt-6"
              >
                <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedMethod === PAYMENT_METHOD.PAYPAL 
                    ? "You will be redirected to PayPal's secure portal to complete the transaction. We don't store your credit card details." 
                    : "For Bank Transfers, your booking will be confirmed once we verify the receipt of funds. Instructions will be sent to your email."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-400" />
              Summary
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Service Fee</span>
                <span className="font-bold">${bookingData.service?.price?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Processing</span>
                <span className="font-bold">${bookingData.files?.length > 0 ? '50.00' : '0.00'}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Total</span>
                <span className="text-3xl font-black">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={!selectedMethod || isProcessing}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                selectedMethod && !isProcessing
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `Pay Now`
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">SSL Secure Payment</span>
            </div>
          </div>

          <button
            onClick={prevStep}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Review
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentStep;
