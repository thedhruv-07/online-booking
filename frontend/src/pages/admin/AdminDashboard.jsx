import { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';
import { formatCurrency } from '../../utils/helpers';

/**
 * Admin Dashboard - Overview of system metrics
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await bookingService.getAdminStats();
        
        // Transform real data into the format needed for the UI
        const statsArray = [
          { label: 'Total Users', value: (data.totalUsers || 0).toLocaleString(), change: '', color: 'bg-blue-500' },
          { label: 'Total Bookings', value: (data.totalBookings || 0).toLocaleString(), change: '', color: 'bg-green-500' },
          { label: 'Total Payments', value: (data.totalPayments || 0).toLocaleString(), change: '', color: 'bg-yellow-500' },
          { label: 'Revenue', value: formatCurrency(data.revenue || 0), change: '', color: 'bg-purple-500' },
        ];
        
        setStats(statsArray);
        
        // Use real recent bookings for activities if available
        if (data.recentBookings) {
          const activities = data.recentBookings.map(b => ({
            id: b._id,
            action: `New booking by ${b.userId?.name || b.userId?.email || 'User'}`,
            time: new Date(b.createdAt).toLocaleDateString()
          }));
          setRecentActivities(activities);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100"></div>
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">i</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <span className="block text-2xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-900">Manage Users</span>
            </a>
            <a href="/admin/bookings" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <span className="block text-2xl mb-2">📋</span>
              <span className="text-sm font-medium text-gray-900">All Bookings</span>
            </a>
            <a href="/admin/payments" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <span className="block text-2xl mb-2">💳</span>
              <span className="text-sm font-medium text-gray-900">Payment Review</span>
            </a>
            <a href="/admin/reports" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <span className="block text-2xl mb-2">📈</span>
              <span className="text-sm font-medium text-gray-900">Reports</span>
            </a>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-green-800">API Server</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-green-800">Database</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-green-800">Email Service</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
