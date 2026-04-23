import React from 'react';
import { useBooking } from '../../hooks/useBooking';
import WelcomeHeader from '../../components/dashboard/WelcomeBanner';
import StatsCards from '../../components/dashboard/StatsCard';
import BookingsTable from '../../components/dashboard/RecentBookingsTable';
import QuickActions from '../../components/dashboard/QuickActions';
import UpcomingBookings from '../../components/dashboard/UpcomingBookings';
import RecentActivity from '../../components/dashboard/RecentActivity';

/**
 * Main Dashboard — Production SaaS layout
 */
const Dashboard = () => {
  const { bookings, isLoading } = useBooking();

  return (
    <div className="space-y-6 pb-8">
      {/* Section 1: Welcome Header */}
      <WelcomeHeader />

      {/* Section 2: Stats Cards */}
      <StatsCards bookings={bookings || []} />

      {/* Section 3 + 4 + 5 + 6: Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Bookings Table */}
        <div className="xl:col-span-8">
          <BookingsTable bookings={bookings || []} isLoading={isLoading} />
        </div>

        {/* Right Column: Panels */}
        <div className="xl:col-span-4 space-y-6">
          <QuickActions />
          <UpcomingBookings bookings={bookings || []} />
          <RecentActivity bookings={bookings || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
