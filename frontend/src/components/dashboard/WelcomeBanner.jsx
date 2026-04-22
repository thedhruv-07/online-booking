import React from 'react';
import { useAuth } from '../../store/authStore';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeBanner = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="relative bg-white rounded-[2rem] p-10 lg:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all group">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -mr-64 -mt-64 group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] -ml-40 -mb-40 group-hover:bg-blue-500/10 transition-colors duration-1000"></div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-full flex items-center gap-2 shadow-lg">
              <Sparkles size={12} strokeWidth={3} />
              Operational Insight
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1]">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">{firstName}</span>
          </h1>
          <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-2xl">
            Your intelligence throughput is up by <span className="text-emerald-500 font-black tracking-tight underline underline-offset-8 decoration-2 decoration-emerald-500/30">12.4%</span>. You have <span className="text-slate-900 font-black tracking-tight">3 critical dossiers</span> awaiting synchronization today.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-5 shrink-0">
          <Link 
            to="/booking/create"
            className="h-16 px-10 bg-slate-900 text-white rounded-[1.25rem] font-black flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 hover:scale-[1.03] active:scale-95 transition-all"
          >
            New Directive
            <ArrowRight size={22} strokeWidth={3} />
          </Link>
          <button className="h-16 px-10 bg-white text-slate-900 border-2 border-slate-100 rounded-[1.25rem] font-black flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95">
            <Calendar size={22} />
            Scheduler
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
