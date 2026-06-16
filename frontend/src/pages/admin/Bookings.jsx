import { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';
import { formatCurrency } from '../../utils/helpers';
import { X } from 'lucide-react';

const Bookings = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const data = await bookingService.getAllBookings();
        setAllBookings(data.bookings || data);
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

  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-xs text-gray-900 font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  ) : null;

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="bg-gray-50 rounded-lg px-3 py-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
      </div>

      {/* Stats */}
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

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
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
                      <span>Loading bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : allBookings.length > 0 ? (
                allBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-900">{booking._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.userId?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{booking.userId?.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{(booking.service?.selected || []).join(', ') || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(booking.service?.totalAmount ?? 0)}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(booking)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 space-y-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
                <p className="text-xs text-gray-400 font-mono">{selected._id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <Section title="Client">
              <Row label="Name" value={selected.userId?.name} />
              <Row label="Email" value={selected.userId?.email} />
            </Section>

            <Section title="Service">
              <Row label="Type" value={(selected.service?.selected || []).join(', ')} />
              <Row label="Country" value={selected.service?.country} />
              <Row label="Base Price" value={selected.service?.basePrice ? `$${selected.service.basePrice}` : null} />
              <Row label="Total Amount" value={selected.service?.totalAmount ? `$${selected.service.totalAmount}` : null} />
            </Section>

            <Section title="Product">
              <Row label="Name" value={selected.product?.name} />
              <Row label="Description" value={selected.product?.description} />
              <Row label="Unit Type" value={selected.product?.unitType} />
              <Row label="Quantity" value={selected.product?.quantity} />
              <Row label="Pieces In Set" value={selected.product?.piecesInSet} />
              <Row label="PO Number" value={selected.product?.poNumber} />
              <Row label="Inspection Date" value={selected.inspectionDate ? new Date(selected.inspectionDate).toLocaleDateString() : null} />
            </Section>

            <Section title="Factory">
              <Row label="Name" value={selected.factory?.name} />
              <Row label="Address" value={selected.factory?.address} />
              <Row label="City" value={selected.factory?.city} />
              <Row label="Country" value={selected.factory?.country} />
              <Row label="Postal Code" value={selected.factory?.postalCode} />
            </Section>

            <Section title="Contact Person">
              <Row label="Name" value={selected.contact?.name} />
              <Row label="Email" value={selected.contact?.email} />
              <Row label="Phone" value={selected.contact?.countryCode ? `${selected.contact.countryCode} ${selected.contact.phone}` : selected.contact?.phone} />
              <Row label="Position" value={selected.contact?.position} />
            </Section>

            <Section title="AQL">
              <Row label="Inspection Level" value={selected.aql?.inspectionLevel} />
              <Row label="Lot Size" value={selected.aql?.lotSize} />
              <Row label="Sample Size" value={selected.aql?.sampleSize} />
              <Row label="Major Defect Limit" value={selected.aql?.majorDefectLimit} />
              <Row label="Minor Defect Limit" value={selected.aql?.minorDefectLimit} />
              <Row label="Accept Point" value={selected.aql?.acceptPoint} />
              <Row label="Reject Point" value={selected.aql?.rejectPoint} />
            </Section>

            <Section title="Payment">
              <Row label="Status" value={selected.payment?.status} />
              <Row label="Method" value={selected.payment?.method} />
              <Row label="Paid At" value={selected.payment?.paidAt ? new Date(selected.payment.paidAt).toLocaleString() : null} />
            </Section>

            {selected.bookingFiles?.length > 0 && (
              <Section title="Documents">
                {selected.bookingFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-700">{f.filename}</span>
                    {f.url && (
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Download</a>
                    )}
                  </div>
                ))}
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
