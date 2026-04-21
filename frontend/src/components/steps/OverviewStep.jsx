import { useBooking } from '../../hooks/useBooking';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/helpers';

/**
 * Step 8: Booking Overview
 */
const OverviewStep = () => {
  const { bookingData, prevStep, nextStep, setOverview } = useBooking();


  const handleConfirm = () => {
    const summary = {
      totalAmount: calculateTotal(),
      itemCount: 1,
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setOverview(summary);
    nextStep();
  };


  const calculateTotal = () => {
    // Base service price
    const servicePrice = bookingData.service?.price || 0;

    // Additional costs based on selections
    let total = servicePrice;

    // Add file upload handling fee if files present
    if (bookingData.files && bookingData.files.length > 0) {
      total += 50; // File processing fee
    }

    return total;
  };

  const renderDetailRow = (label, value) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Booking Overview</h2>
      <p className="text-gray-600 mb-6">
        Review your booking details before proceeding to payment.
      </p>

      <div className="space-y-6">
        {/* Service */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
              1
            </span>
            Service
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderDetailRow('Service Type', bookingData.service?.name || 'N/A')}
            {renderDetailRow('Base Price', formatCurrency(bookingData.service?.price || 0))}
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
              2
            </span>
            Location
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderDetailRow('Address', `${bookingData.location?.address || 'N/A'}, ${bookingData.location?.city || ''}`)}
            {renderDetailRow('Country', bookingData.location?.country || 'N/A')}
            {renderDetailRow('Postal Code', bookingData.location?.postalCode || 'N/A')}
          </div>
        </section>

        {/* Product */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
              3
            </span>
            Product
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderDetailRow('Product Type', bookingData.product?.name || 'N/A')}
            {bookingData.product?.category && renderDetailRow('Category', bookingData.product.category)}
          </div>
        </section>

        {/* Uploads */}
        {bookingData.files?.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
                4
              </span>
              Documents
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {bookingData.files.map((file) => (
                <div key={file.id} className="flex items-center py-2">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Factory */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
              5
            </span>
            Factory
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderDetailRow('Factory', bookingData.factory?.name || 'N/A')}
            {bookingData.factory?.location && renderDetailRow('Location', bookingData.factory.location)}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
              6
            </span>
            Contact
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderDetailRow('Contact Person', bookingData.contact?.name || 'N/A')}
            {renderDetailRow('Email', bookingData.contact?.email || 'N/A')}
            {renderDetailRow('Phone', bookingData.contact?.phone || 'N/A')}
            {bookingData.contact?.company && renderDetailRow('Company', bookingData.contact.company)}
          </div>
        </section>

        {/* AQL */}
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mr-2">
              7
            </span>
            AQL Configuration
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderDetailRow('Inspection Level', bookingData.aql?.inspectionLevel === 'general' ? 'General' : 'Special')}
            {renderDetailRow('Sample Size', bookingData.aql?.sampleSize === 'level-1' ? 'Level I' : bookingData.aql?.sampleSize === 'level-2' ? 'Level II' : 'Level III')}
            {renderDetailRow('Accept Limit', bookingData.aql?.acceptLimit || 'N/A')}
            {renderDetailRow('Reject Limit', bookingData.aql?.rejectLimit || 'N/A')}
          </div>
        </section>
      </div>

      {/* Total */}
      <div className="mt-6 p-6 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Estimated Total</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</p>
          </div>
          <p className="text-sm text-gray-500">
            Final price may vary based on actual inspection time
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={prevStep}>
          Back
        </Button>
        <Button type="button" onClick={handleConfirm}>
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default OverviewStep;
