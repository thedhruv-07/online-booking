import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  CreditCard 
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { useBooking } from '../../hooks/useBooking';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentBookingsTable from '../../components/dashboard/RecentBookingsTable';

/**
 * Modern SaaS Dashboard
 */
const Dashboard = () => {
  const { bookings, isLoading } = useBooking();

  // Simple stats calculation
  const stats = [
    {
      title: 'Total Bookings',
      value: bookings?.length || 0,
      icon: ClipboardList,
      trend: 'up',
      trendValue: '12%',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pending',
      value: bookings?.filter(b => b.status === 'pending').length || 0,
      icon: Clock,
      trend: 'down',
      trendValue: '5%',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Completed',
      value: bookings?.filter(b => b.status === 'completed' || b.status === 'confirmed').length || 0,
      icon: CheckCircle2,
      trend: 'up',
      trendValue: '8%',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Spent',
      value: `$${bookings?.reduce((acc, b) => acc + (b.payment?.amount || 0), 0).toFixed(2) || '0.00'}`,
      icon: CreditCard,
      trend: 'up',
      trendValue: '15%',
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <WelcomeBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Recent Bookings */}
        <div className="xl:col-span-2">
          <RecentBookingsTable bookings={bookings || []} isLoading={isLoading} />
        </div>

        {/* Right Column: Quick Actions & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/booking/create" 
                className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors font-semibold"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <ClipboardList size={20} />
                </div>
                New Booking
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors font-semibold"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                Account Settings
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-200">
            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Our support team is available 24/7 to help you with your inspections.
            </p>
            <button className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
