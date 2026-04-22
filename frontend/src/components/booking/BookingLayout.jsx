import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/authStore';

const BookingLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/booking/create' }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-8 lg:px-16 xl:px-24">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 border-b border-slate-200 pb-10">
          <div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight lg:text-6xl">Create Booking</h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">Configure your inspection request step by step in our high-end booking engine.</p>
          </div>
          
          <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-start gap-4 max-w-md shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              <span className="text-slate-900 font-bold block mb-1 uppercase tracking-wider">Draft Mode Active</span>
              Your progress is automatically saved. You can resume at any time from your dashboard without losing any details.
            </p>
          </div>
        </div>

        {/* Step content will be rendered here */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-12 lg:p-16">
          <Outlet />
        </div>

        <footer className="mt-16 pb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200 pt-10 text-slate-400 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} Absolute Veritas Quality Assurance. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingLayout;
