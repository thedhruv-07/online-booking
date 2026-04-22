import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  CreditCard,
  ArrowRight,
  User as UserIcon,
  ShieldCheck
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
      title: 'Active Pending',
      value: bookings?.filter(b => b.status === 'pending').length || 0,
      icon: Clock,
      trend: 'down',
      trendValue: '5%',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Success Rate',
      value: '98.2%',
      icon: CheckCircle2,
      trend: 'up',
      trendValue: '2%',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Revenue',
      value: `$${bookings?.reduce((acc, b) => acc + (b.payment?.amount || 0), 0).toFixed(2) || '0.00'}`,
      icon: CreditCard,
      trend: 'up',
      trendValue: '15%',
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Section */}
      <WelcomeBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Recent Bookings */}
        <div className="xl:col-span-8">
          <RecentBookingsTable bookings={bookings || []} isLoading={isLoading} />
        </div>

        {/* Right Column: Quick Actions & Info */}
        <div className="xl:col-span-4 space-y-10">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/40 transition-all">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Direct Access</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link 
                to="/booking/create" 
                className="group flex items-center justify-between p-6 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <ClipboardList size={22} />
                  </div>
                  <span className="font-bold">New Booking</span>
                </div>
                <ArrowRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link 
                to="/profile" 
                className="group flex items-center justify-between p-6 rounded-2xl bg-white border-2 border-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <UserIcon size={22} />
                  </div>
                  <span className="font-bold">Account Hub</span>
                </div>
                <ArrowRight size={20} className="opacity-0 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-white/20 transition-colors duration-1000"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Need Assistance?</h3>
              <p className="text-indigo-100 font-medium mb-10 leading-relaxed">
                Our global support network is available 24/7 to facilitate your quality assurance requirements.
              </p>
              <button className="w-full h-16 rounded-2xl bg-white text-indigo-600 font-black hover:bg-indigo-50 transition-all shadow-2xl active:scale-95">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
