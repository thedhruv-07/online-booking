import { useState, useEffect } from 'react';
import { paymentService } from '../../services/payment.service';
import { formatCurrency } from '../../utils/helpers';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getAllPayments();
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch admin payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);


  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };



  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <button className="btn-secondary">Export Report</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pending Confirmation</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Average Payment</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length)}
          </p>
        </div>
      </div>

      {/* Pending Actions */}
      {pendingPayments.length > 0 && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4">Pending Bank Transfers</h2>
          <p className="text-sm text-yellow-700 mb-4">
            The following payments require manual verification of bank transfer receipts.
          </p>
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-900">
                    {payment.user} - {payment.bookingId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(payment.amount)} via {payment.method === 'paypal' ? 'PayPal' : 'Bank Transfer'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-success text-sm">Verify</button>
                  <button className="btn-danger text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Payments Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <span>Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.id}</td>
                    <td className="px-6 py-4 text-gray-500">{payment.bookingId}</td>
                    <td className="px-6 py-4 text-gray-900">{payment.user}</td>
                    <td className="px-6 py-4 text-gray-500 capitalize">{payment.method.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{payment.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
