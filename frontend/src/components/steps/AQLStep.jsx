import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';


/**
 * Step 7: AQL Configuration
 */
const AQLStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const [formData, setFormData] = useState({
    inspectionLevel: bookingData.aql?.inspectionLevel || 'general',
    sampleSize: bookingData.aql?.sampleSize || 'level-2',
    acceptLimit: bookingData.aql?.acceptLimit || '0',
    rejectLimit: bookingData.aql?.rejectLimit || '0',
  });

  const inspectionLevels = [
    { value: 'general', label: 'General Inspection Level' },
    { value: 'special', label: 'Special Inspection Level' },
  ];

  const sampleSizeLevels = [
    { value: 'level-1', label: 'Level I - Reduced sample' },
    { value: 'level-2', label: 'Level II - Normal sample' },
    { value: 'level-3', label: 'Level III - Increased sample' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStepData('aql', formData);
    nextStep();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">AQL Configuration</h2>
      <p className="text-gray-600 mb-6">
        Configure Acceptable Quality Level (AQL) sampling parameters for your inspection.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Inspection Level"
            name="inspectionLevel"
            value={formData.inspectionLevel}
            onChange={handleChange}
            options={inspectionLevels}
            required
          />

          <Select
            label="Sample Size Level"
            name="sampleSize"
            value={formData.sampleSize}
            onChange={handleChange}
            options={sampleSizeLevels}
            required
          />

          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-4">
              The following limits determine pass/fail criteria based on number of defects found.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Accept Limit (Ac)"
                name="acceptLimit"
                type="number"
                min="0"
                value={formData.acceptLimit}
                onChange={handleChange}
                placeholder="0"
                required
              />

              <Input
                label="Reject Limit (Re)"
                name="rejectLimit"
                type="number"
                min="0"
                value={formData.rejectLimit}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">AQL Reference</h4>
          <p className="text-sm text-blue-800">
            AQL is a statistical measure used in quality control. Standard levels provide
            objective criteria for accepting or rejecting production lots. For most consumer
            goods, AQL 2.5 (major defects) and 4.0 (minor defects) are common.
          </p>
        </div>

        <div className="mt-8 flex justify-between">
          <Button type="button" variant="secondary" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">Continue to Overview</Button>
        </div>
      </form>
    </div>
  );
};

export default AQLStep;
