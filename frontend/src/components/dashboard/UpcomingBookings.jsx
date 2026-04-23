import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const statusDot = {
  pending: 'bg-amber-400',
  confirmed: 'bg-blue-400',
  in_progress: 'bg-indigo-400',
  completed: 'bg-emerald-400',
  cancelled: 'bg-red-400',
};

const UpcomingBookings = ({ bookings = [] }) => {
  // Filter upcoming: non-completed, non-cancelled, sorted by date
  const upcoming = bookings
    .filter(b => !['completed', 'cancelled'].includes(b.status?.toLowerCase()))
    .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Upcoming Bookings</h3>
        <Calendar size={15} className="text-gray-400" />
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-1">
          {upcoming.map((booking) => (
            <Link
              key={booking._id}
              to={`/dashboard/bookings/${booking._id}`}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                statusDot[booking.status?.toLowerCase()] || 'bg-gray-300'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking.service?.name || 'Inspection'}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  {booking.factory?.name || booking.location?.city || 'TBD'}
                </p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Calendar size={20} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No upcoming bookings</p>
          <p className="text-xs text-gray-400 mt-0.5">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
