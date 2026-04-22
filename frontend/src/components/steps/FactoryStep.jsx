import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { Factory, MapPin, Search } from 'lucide-react';
import { factories as mockFactories } from '../../utils/constants';

/**
 * Step 5: Factory Information
 */
const FactoryStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const [selectedFactoryId, setSelectedFactoryId] = useState(bookingData.factory?.id || '');

  const handleContinue = () => {
    if (!selectedFactoryId) return;
    
    const factoryData = mockFactories.find(f => f.id === selectedFactoryId) || { id: 'custom', name: 'Other' };
    updateStepData('factory', factoryData);
    nextStep();
  };

  const factoryOptions = [
    ...mockFactories.map(f => ({ id: f.id, name: f.name })),
    { id: 'other', name: 'Other Factory' }
  ];

  const selectedFactory = mockFactories.find(f => f.id === selectedFactoryId);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Factory size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Factory Selection</h2>
        <p className="text-slate-500 font-medium">Select the factory where the inspection will take place. We'll use this information to coordinate with their production team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Factory Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <Search size={14} className="text-slate-500" />
            Select Factory <span className="text-rose-500">*</span>
          </label>
          <Select
            value={selectedFactoryId}
            onChange={(e) => setSelectedFactoryId(e.target.value)}
            options={factoryOptions}
            placeholder="Choose a Factory"
            className="h-14 rounded-2xl border-slate-200 focus:border-slate-800 focus:ring-slate-800/20"
          />
        </div>

        {/* Factory Info Card */}
        {selectedFactory && (
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{selectedFactory.name}</h4>
                <p className="text-slate-500 text-sm mt-1">{selectedFactory.location}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-8 flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={prevStep}
          className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
        >
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleContinue}
          disabled={!selectedFactoryId}
          className="h-14 px-10 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 shadow-lg disabled:opacity-50"
        >
          Continue to Contact
        </Button>
      </div>
    </div>
  );
};

export default FactoryStep;
