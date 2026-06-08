import React from 'react';
import { useAuth } from '../../store/authStore';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeHeader = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[140%] bg-av-orange-light rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[100%] bg-av-light-blue rounded-full blur-[80px] opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-av-orange-light text-av-orange text-[10px] font-bold uppercase tracking-widest mb-6 border border-av-orange/20">
            Welcome Back
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Welcome Back, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-slate-500 font-medium text-base lg:text-lg leading-relaxed">
            Manage inspections, track booking progress, download reports and monitor project status from a single dashboard.
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
            View Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
