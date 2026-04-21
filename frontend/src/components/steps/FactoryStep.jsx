import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { factories as mockFactories } from '../../utils/constants';

/**
 * Step 5: Factory Information
 */
const FactoryStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const [selectedFactory, setSelectedFactory] = useState(bookingData.factory?.id || '');
  const [customFactory, setCustomFactory] = useState(bookingData.factory?.name || '');

  const handleContinue = () => {
    const factoryData = selectedFactory === 'other'
      ? {
          id: 'custom',
          name: customFactory,
          location: '',
          capacity: '',
          certifications: [],
        }
      : mockFactories.find(f => f.id === selectedFactory);

    updateStepData('factory', factoryData);
    nextStep();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Factory Information</h2>
      <p className="text-gray-600 mb-6">
        Select the factory where production will take place.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockFactories.map((factory) => (
            <div
              key={factory.id}
              onClick={() => setSelectedFactory(factory.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedFactory === factory.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="factory"
                  value={factory.id}
                  checked={selectedFactory === factory.id}
                  onChange={() => setSelectedFactory(factory.id)}
                  className="mt-1"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{factory.name}</h3>
                  <p className="text-sm text-gray-500">{factory.location}</p>
                  <p className="text-sm text-gray-500">Capacity: {factory.capacity}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {factory.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Other option */}
          <div
            onClick={() => setSelectedFactory('other')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedFactory === 'other'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="factory"
                value="other"
                checked={selectedFactory === 'other'}
                onChange={() => setSelectedFactory('other')}
                className="mt-1"
              />
              <div>
                <h3 className="font-semibold text-gray-900">Other Factory</h3>
                <p className="text-sm text-gray-500">Enter factory details manually</p>
              </div>
            </div>
          </div>
        </div>

        {selectedFactory === 'other' && (
          <div className="mt-4 space-y-4">
            <Input
              label="Factory Name"
              value={customFactory}
              onChange={(e) => setCustomFactory(e.target.value)}
              placeholder="Enter factory name"
              required
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={prevStep}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!selectedFactory || (selectedFactory === 'other' && !customFactory)}
        >
          Continue to Contact
        </Button>
      </div>
    </div>
  );
};

export default FactoryStep;
