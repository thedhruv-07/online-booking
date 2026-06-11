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
          <Loader2 className="w-10 h-10 text-av-orange animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/booking/create' }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-av-orange font-semibold text-sm transition-colors mb-5 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Booking</h1>
            <p className="text-slate-400 mt-1.5 text-sm">Configure your inspection request step by step.</p>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-lg flex items-start gap-3 max-w-sm shadow-av-card">
            <div className="w-8 h-8 rounded-lg bg-av-orange-light flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-av-orange" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-700 font-semibold block mb-0.5">Draft Mode Active</span>
              Your progress is automatically saved. Resume anytime from your dashboard.
            </p>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-av-card p-6 sm:p-10 lg:p-12">
          <Outlet />
        </div>

        <footer className="mt-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-200 pt-8 text-slate-400 text-xs font-medium">
          <p>© {new Date().getFullYear()} Absolute Veritas Quality Assurance. All rights reserved.</p>
          <div className="flex gap-6">
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
