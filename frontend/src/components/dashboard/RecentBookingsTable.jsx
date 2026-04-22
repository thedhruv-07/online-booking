import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
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
      <div className="bg-white rounded-[2rem] border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden transition-all">
      <div className="px-8 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Live Transaction Monitor</p>
        </div>
        <Link 
          to="/bookings" 
          className="h-12 px-6 bg-white border-2 border-slate-50 rounded-xl text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center gap-2 shadow-sm"
        >
          Explore All
          <ArrowRight size={14} strokeWidth={3} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Service Details</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Logistics</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Timestamp</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Financials</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.length > 0 ? (
              bookings.slice(0, 5).map((booking) => {
                const status = statusConfig[booking.status?.toLowerCase()] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-7">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{booking.service?.name || 'Inspection Service'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1.5 tracking-tighter">ID: {booking._id.slice(-12).toUpperCase()}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-sm font-bold text-slate-700">{booking.location?.city || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{booking.location?.country || 'N/A'}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-sm font-bold text-slate-700">
                        {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Scheduled</div>
                    </td>
                    <td className="px-8 py-7">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm",
                        status.className
                      )}>
                        <StatusIcon size={12} strokeWidth={2.5} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="text-xl font-black text-slate-900">${booking.payment?.amount?.toFixed(2) || '0.00'}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">USD - Gross</div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <Link 
                        to={`/bookings/${booking._id}`}
                        className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-white border-2 border-transparent hover:border-slate-100 rounded-2xl transition-all inline-flex items-center justify-center shadow-sm active:scale-95"
                      >
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                      <Clock size={40} />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.25em] text-[10px]">No active dossiers found in your recent history</p>
                  </div>
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
