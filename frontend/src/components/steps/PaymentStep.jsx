import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { PAYMENT_METHOD } from '../../utils/constants';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { formatCurrency } from '../../utils/helpers';

/**
 * Step 9: Payment
 */
const PaymentStep = () => {
  const { bookingData, setPayment, prevStep, submitBooking } = useBooking();
  const [selectedMethod, setSelectedMethod] = useState(bookingData.payment?.method || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { id: PAYMENT_METHOD.PAYPAL, name: 'PayPal', icon: PayPalIcon, description: 'Pay securely with PayPal' },
    { id: PAYMENT_METHOD.BANK_TRANSFER, name: 'Bank Transfer', icon: BankIcon, description: 'Direct bank transfer' },
  ];

  const calculateTotal = () => {
    const servicePrice = bookingData.service?.price || 0;
    let total = servicePrice;
    if (bookingData.files && bookingData.files.length > 0) {
      total += 50; // File processing fee
    }
    return total;
  };

  const handlePayment = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // Save payment method
      setPayment({ method: selectedMethod });

      // Submit booking
      const result = await submitBooking();

      if (result.success) {
        // Redirect based on payment method
        if (selectedMethod === PAYMENT_METHOD.PAYPAL) {
          window.location.href = `/payment/paypal/${result.booking.id}`;
        } else {
          // For bank transfer, redirect to dashboard after short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      } else {
        // Display error from submission
        setError(result.error || 'Failed to submit booking. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = selectedMethod && !isProcessing;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>
      <p className="text-gray-600 mb-6">
        Choose your preferred payment method to complete your booking.
      </p>

      {/* Total Summary */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(calculateTotal())}
          </span>
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Payment Methods */}
      <div className="space-y-4 mb-8">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex items-center flex-1">
                  <Icon className="w-8 h-8 text-gray-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMethod === PAYMENT_METHOD.PAYPAL && (
        <Alert type="info" className="mb-6">
          You will be redirected to PayPal to complete your payment securely.
        </Alert>
      )}

      {selectedMethod === PAYMENT_METHOD.BANK_TRANSFER && (
        <Alert type="info" className="mb-6">
          After confirming, you will receive bank account details via email to complete the transfer.
        </Alert>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handlePayment}
          loading={isProcessing}
          disabled={!canProceed}
        >
          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(calculateTotal())}`}
        </Button>
      </div>
    </div>
  );
};

// Payment method icons
const PayPalIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 4.72a.771.771 0 0 1 .757-.64h7.547c1.833 0 3.367.623 4.592 1.867 1.225 1.244 1.867 2.759 1.867 4.592 0 1.833-.642 3.348-1.867 4.592-1.225 1.243-2.759 1.867-4.592 1.867h-1.99l-1.49 1.761a.641.641 0 0 1-.633.558H8.27a.771.771 0 0 1-.757-.64L1.39 8.378a.771.771 0 0 1 .566-1.152l6.164-7.247a.641.641 0 0 1 .633-.078zM20.693 11.32c-.743-.105-1.498-.142-2.27-.125a.641.641 0 0 0-.633.678l2.45 3.822-2.45 3.822a.641.641 0 0 0 .633.742c.743.105 1.498.143 2.27.125a.641.641 0 0 0 .632-.679l-2.45-3.822 2.45-3.822a.641.641 0 0 0-.632-.677z"/>
  </svg>
);

const BankIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export default PaymentStep;
