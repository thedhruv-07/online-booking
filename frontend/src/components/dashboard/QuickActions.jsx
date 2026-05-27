import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, CreditCard, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const actions = [
  {
    label: 'Create Booking',
    description: 'Start a new inspection booking',
    icon: Plus,
    to: '/booking/create',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'View All Bookings',
    description: 'Browse your booking history',
    icon: ClipboardList,
    to: '/dashboard/bookings',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Payment History',
    description: 'Review past payments',
    icon: CreditCard,
    to: '/dashboard/payments',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

const QuickActions = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", action.iconBg)}>
              <action.icon size={16} className={action.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500 truncate">{action.description}</p>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
