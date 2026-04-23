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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your bookings today.
        </p>
      </div>
      
      <Link 
        to="/booking/create"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus size={16} strokeWidth={2.5} />
        Create Booking
      </Link>
    </div>
  );
};

export default WelcomeHeader;
