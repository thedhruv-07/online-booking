import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Input from '../ui/Input';
import Button from '../ui/Button';

/**
 * Step 2: Location Information
 */
const LocationStep = () => {
  const { updateStepData, bookingData, nextStep, prevStep } = useBooking();
  const [formData, setFormData] = useState({
    country: bookingData.location?.country || '',
    city: bookingData.location?.city || '',
    address: bookingData.location?.address || '',
    postalCode: bookingData.location?.postalCode || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStepData('location', formData);
    nextStep();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Location Details</h2>
      <p className="text-gray-600 mb-6">
        Where will the inspection take place?
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter country"
            required
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            required
          />

          <div className="md:col-span-2">
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, building, etc."
              required
            />
          </div>

          <Input
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal/ZIP code"
            required
          />
        </div>

        <div className="mt-8 flex justify-between">
          <Button type="button" variant="secondary" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">Continue to Product</Button>
        </div>
      </form>
    </div>
  );
};

export default LocationStep;
