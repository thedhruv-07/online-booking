import { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';
import { formatCurrency } from '../../utils/helpers';

const Bookings = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const data = await bookingService.getAllBookings();
        setAllBookings(data);
      } catch (error) {
        console.error('Failed to fetch admin bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBookings();
  }, []);


  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <div className="flex space-x-3">
          <button className="btn-secondary">Export CSV</button>
          <button className="btn-secondary">Filter</button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: allBookings.length, color: 'bg-gray-500' },
          { label: 'Pending', count: allBookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'Confirmed', count: allBookings.filter(b => b.status === 'confirmed').length, color: 'bg-blue-500' },
          { label: 'In Progress', count: allBookings.filter(b => b.status === 'in_progress').length, color: 'bg-purple-500' },
          { label: 'Completed', count: allBookings.filter(b => b.status === 'completed').length, color: 'bg-green-500' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} text-white p-4 rounded-lg`}>
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm opacity-90">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <span>Loading all bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : allBookings.length > 0 ? (
                allBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 text-gray-500">{booking.user}</td>
                    <td className="px-6 py-4 text-gray-900">{booking.service}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(booking.amount)}</td>
                    <td className="px-6 py-4 text-gray-500">{booking.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                        <button className="text-orange-600 hover:text-orange-800">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No bookings found in the system.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
