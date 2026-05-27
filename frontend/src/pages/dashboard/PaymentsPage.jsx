import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';

/**
 * Payments Placeholder Page
 */
const PaymentsPage = () => {
  const { bookings } = useBooking();
  
  const paidBookings = (bookings || []).filter(b => b.paymentStatus === 'paid');
  const pendingBookings = (bookings || []).filter(b => b.paymentStatus === 'pending' || !b.paymentStatus);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage your booking payments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Payments</p>
          <p className="text-2xl font-semibold text-gray-900">{paidBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Pending Payments</p>
          <p className="text-2xl font-semibold text-orange-600">{pendingBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
          <p className="text-2xl font-semibold text-gray-900">{(bookings || []).length}</p>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
        </div>

        {paidBookings.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {paidBookings.slice(0, 10).map((booking) => (
              <div key={booking._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CreditCard size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.service?.name || 'Booking'}</p>
                    <p className="text-xs text-gray-500">#{booking._id?.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(booking.payment?.amount || booking.totalAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-600">Paid</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <CreditCard size={24} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No payments yet</p>
            <p className="text-xs text-gray-400 mt-1">Payments will appear here after you complete a booking</p>
            <Link 
              to="/booking/create"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              Create a booking <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
