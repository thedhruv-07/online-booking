import React from 'react';
import { ClipboardList, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Derives a simple activity feed from bookings data.
 */
const getActivityFromBookings = (bookings = []) => {
  const activities = [];

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
        iconColor: 'text-av-navy',
        iconBg: 'bg-av-light-blue',
        text: `Payment received for #${id}`,
        time,
      });
    } else {
      activities.push({
        id: `${b._id}-created`,
        icon: ClipboardList,
        iconColor: 'text-gray-500',
        iconBg: 'bg-gray-100',
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
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-av-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Recent Activity</h3>
        <Clock size={16} className="text-gray-400" />
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm", activity.iconBg)}>
                <activity.icon size={14} className={activity.iconColor} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-gray-700 leading-snug">{activity.text}</p>
                <p className="text-xs font-bold text-gray-400 mt-1">{formatRelativeTime(activity.time)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 mt-2">
          <Clock size={24} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
