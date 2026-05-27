import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, ClipboardList, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useBooking } from '../../hooks/useBooking';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
  in_progress: { label: 'In Progress', className: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: AlertCircle },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

const paymentConfig = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Unpaid', className: 'bg-orange-50 text-orange-700' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700' },
};

const BookingsTable = ({ bookings = [], isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { deleteBooking } = useBooking();

  const initiateDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      setDeletingId(confirmDeleteId);
      const idToDelete = confirmDeleteId;
      setConfirmDeleteId(null);
      await deleteBooking(idToDelete);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Filter bookings
  const filtered = bookings.filter(b => {
    const matchesSearch = !searchQuery || 
      b._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status?.toLowerCase() === statusFilter;
    const matchesPayment = paymentFilter === 'all' || b.paymentStatus?.toLowerCase() === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const displayBookings = filtered.slice(0, 8);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-xs text-gray-500 mt-0.5">{bookings.length} total bookings</p>
          </div>
          <Link 
            to="/dashboard/bookings" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-50 flex flex-wrap items-center gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Unpaid</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayBookings.length > 0 ? (
                displayBookings.map((booking) => {
                  const status = statusConfig[booking.status?.toLowerCase()] || statusConfig.pending;
                  const payment = paymentConfig[booking.paymentStatus?.toLowerCase()] || paymentConfig.pending;
                  const isDeleting = deletingId === booking._id;

                  return (
                    <tr key={booking._id} className={cn("hover:bg-gray-50/50 transition-colors", isDeleting && "opacity-50")}>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-gray-500">
                          #{booking._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium text-gray-900">{booking.service?.name || 'Inspection'}</div>
                        <div className="text-xs text-gray-500">{booking.factory?.name || booking.location?.city || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                          status.className
                        )}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          payment.className
                        )}>
                          {payment.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to={`/dashboard/bookings/${booking._id}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => initiateDelete(booking._id)}
                            disabled={isDeleting}
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete booking"
                          >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 mb-3">
                        <ClipboardList size={24} />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No bookings found</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first booking to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Booking</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this booking? This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
                >
                  Yes, Delete it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsTable;
