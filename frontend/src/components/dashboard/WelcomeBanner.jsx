import React from 'react';
import { useAuth } from '../../store/authStore';
import { Sparkles } from 'lucide-react';

const WelcomeBanner = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            Welcome back, {firstName}! <Sparkles className="text-indigo-200" />
          </h1>
          <p className="text-indigo-100 text-lg max-w-xl">
            You have 3 bookings scheduled for today. Your efficiency is up by 12% this week. Keep it up!
          </p>
        </div>
        
        <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-colors w-fit">
          View Schedule
        </button>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-indigo-500 rounded-full opacity-20"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-indigo-700 rounded-full opacity-20"></div>
    </div>
  );
};

export default WelcomeBanner;
