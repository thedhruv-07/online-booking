import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import { api } from '../../services/api';
import StatsCards from '../../components/dashboard/StatsCard';
import BookingsTable from '../../components/dashboard/RecentBookingsTable';
import QuickActions from '../../components/dashboard/QuickActions';
import UpcomingBookings from '../../components/dashboard/UpcomingBookings';
import RecentActivity from '../../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { bookings, isLoading, fetchBookings } = useBooking();
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  useEffect(() => {
    fetchBookings({ limit: 20 });
    api.get('/bookings/upcoming')
      .then(res => setUpcomingBookings(res.data || []))
      .catch(() => setUpcomingBookings([]));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">{today} · Absolute Veritas</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Bookings
          </Link>
          <Link
            to="/booking/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-av-orange rounded-lg hover:bg-av-orange-hover transition-colors"
          >
            + New Booking
          </Link>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Stats */}
      <StatsCards bookings={bookings || []} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <BookingsTable bookings={bookings || []} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-4 space-y-5">
          <QuickActions />
          <UpcomingBookings bookings={upcomingBookings} />
          <RecentActivity bookings={bookings || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
