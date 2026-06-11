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
    iconBg: 'bg-av-orange-light',
    iconColor: 'text-av-orange',
  },
  {
    label: 'View All Bookings',
    description: 'Browse your booking history',
    icon: ClipboardList,
    to: '/dashboard/bookings',
    iconBg: 'bg-av-light-blue',
    iconColor: 'text-av-navy',
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
    <div className="bg-white rounded-lg border border-slate-100 p-5 shadow-av-card">
      <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", action.iconBg)}>
              <action.icon size={18} className={action.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{action.description}</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-av-orange transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
