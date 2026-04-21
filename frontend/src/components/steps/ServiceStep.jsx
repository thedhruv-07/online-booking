import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Button from '../ui/Button';
import { services as mockServices } from '../../utils/constants';

/**
 * Step 1: Service Selection
 */
const ServiceStep = () => {
  const { updateStepData, bookingData, nextStep } = useBooking();

  const [selectedService, setSelectedService] = useState(bookingData.service?.id || '');

  const handleChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);

    const service = mockServices.find((s) => s.id === serviceId);
    updateStepData('service', service ? { id: service.id, name: service.name, price: service.price } : null);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Select Service Type</h2>
      <p className="text-gray-600 mb-6">
        Choose the type of inspection service you need for your products.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockServices.map((service) => (
          <div
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedService === service.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="service"
                value={service.id}
                checked={selectedService === service.id}
                onChange={handleChange}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  ${service.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="button" onClick={nextStep}>
          Continue to Location
        </Button>
      </div>

    </div>
  );
};

export default ServiceStep;
