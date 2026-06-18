import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const statusDot = {
  pending: 'bg-amber-400',
  confirmed: 'bg-av-navy',
  in_progress: 'bg-amber-500',
  completed: 'bg-emerald-400',
  cancelled: 'bg-red-400',
};

const UpcomingBookings = ({ bookings = [] }) => {

  const upcoming = bookings;

  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-av-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Upcoming Bookings</h3>
        <Calendar size={16} className="text-gray-400" />
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-2">
          {upcoming.map((booking) => (
            <Link
              key={booking._id}
              to={`/dashboard/bookings/${booking._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
            >
              <div className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0 shadow-sm",
                statusDot[booking.status?.toLowerCase()] || 'bg-gray-300'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-av-orange transition-colors">
                  {booking.service?.name || 'Inspection'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={12} className="text-gray-400" />
                  {booking.factory?.name || booking.location?.city || 'TBD'}
                </p>
              </div>
              <span className="text-xs font-bold text-gray-400 shrink-0 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                {new Date(booking.inspectionDate || booking.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
          <Calendar size={24} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">No upcoming bookings</p>
          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
