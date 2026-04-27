import React from 'react';
import { useAuth } from '../../store/authStore';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeHeader = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[140%] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[100%] bg-blue-50 rounded-full blur-[80px] opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-100">
            Welcome Back
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {greeting}, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-slate-500 font-medium text-base lg:text-lg leading-relaxed">
            Your inspection portfolio is ready. We've synchronized your latest reports and booking status updates for today.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <Link 
            to="/booking/create"
            className="btn-primary flex items-center justify-center gap-3"
          >
            <Plus size={20} strokeWidth={2.5} />
            New Booking
          </Link>
          <Link 
            to="/dashboard/bookings"
            className="btn-secondary"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
