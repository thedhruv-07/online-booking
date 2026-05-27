import React from 'react';
import { ClipboardList, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Derives a simple activity feed from bookings data.
 */
const getActivityFromBookings = (bookings = []) => {
  const activities = [];

  // Sort by most recent first
  const sorted = [...bookings].sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );

  sorted.slice(0, 8).forEach((b) => {
    const id = b._id?.slice(-6).toUpperCase();
    const time = new Date(b.updatedAt || b.createdAt);

    if (b.status === 'completed') {
      activities.push({
        id: `${b._id}-completed`,
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50',
        text: `Booking #${id} completed`,
        time,
      });
    } else if (b.status === 'cancelled') {
      activities.push({
        id: `${b._id}-cancelled`,
        icon: XCircle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50',
        text: `Booking #${id} cancelled`,
        time,
      });
    } else if (b.paymentStatus === 'paid') {
      activities.push({
        id: `${b._id}-paid`,
        icon: CreditCard,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50',
        text: `Payment received for #${id}`,
        time,
      });
    } else {
      activities.push({
        id: `${b._id}-created`,
        icon: ClipboardList,
        iconColor: 'text-gray-500',
        iconBg: 'bg-gray-50',
        text: `Booking #${id} created`,
        time,
      });
    }
  });

  return activities.slice(0, 5);
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const RecentActivity = ({ bookings = [] }) => {
  const activities = getActivityFromBookings(bookings);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <Clock size={15} className="text-gray-400" />
      </div>

      {activities.length > 0 ? (
        <div className="space-y-0.5">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-lg">
              <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5", activity.iconBg)}>
                <activity.icon size={13} className={activity.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(activity.time)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Clock size={20} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
