import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-rose-50 text-rose-600 border-rose-100',
  },
};

const RecentBookingsTable = ({ bookings, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Recent Bookings</h2>
        <Link to="/bookings" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.length > 0 ? (
              bookings.slice(0, 5).map((booking) => {
                const status = statusConfig[booking.status.toLowerCase()] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{booking.service?.name || 'Inspection Service'}</div>
                      <div className="text-xs text-slate-400">ID: {booking._id.slice(-8).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {booking.location?.city || 'N/A'}, {booking.location?.country || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                        status.className
                      )}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      ${booking.payment?.amount || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/bookings/${booking._id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all inline-flex"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  No recent bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentBookingsTable;
