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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Booking</h1>
            <p className="text-slate-500 font-medium mt-1">Configure your inspection request step by step</p>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3 max-w-sm shadow-sm">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 font-medium leading-relaxed">
              Your progress is automatically saved as a draft. You can resume at any time from your dashboard.
            </p>
          </div>
        </div>

        {/* Step content will be rendered here */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
          <Outlet />
        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} BookingSaaS. Secure & Encrypted Booking Flow.
        </footer>
      </div>
    </div>
  );
};

export default BookingLayout;
