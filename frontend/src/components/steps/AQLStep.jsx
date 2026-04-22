import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Settings, BarChart, CheckSquare, XSquare, Info } from 'lucide-react';

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
    { id: 'general', name: 'General Inspection Level' },
    { id: 'special', name: 'Special Inspection Level' },
  ];

  const sampleSizeLevels = [
    { id: 'level-1', name: 'Level I - Reduced sample' },
    { id: 'level-2', name: 'Level II - Normal sample' },
    { id: 'level-3', name: 'Level III - Increased sample' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    updateStepData('aql', formData);
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Settings size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AQL Configuration</h2>
        <p className="text-slate-500 font-medium">Configure Acceptable Quality Level (AQL) parameters. These standards define the pass/fail criteria for your inspection based on sample size.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inspection Level */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <BarChart size={14} className="text-purple-500" />
            Inspection Level <span className="text-rose-500">*</span>
          </label>
          <Select
            name="inspectionLevel"
            value={formData.inspectionLevel}
            onChange={handleChange}
            options={inspectionLevels}
            placeholder="Select Level"
            className="h-14 rounded-2xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
          />
        </div>

        {/* Sample Size Level */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <BarChart size={14} className="text-purple-500" />
            Sample Size Level <span className="text-rose-500">*</span>
          </label>
          <Select
            name="sampleSize"
            value={formData.sampleSize}
            onChange={handleChange}
            options={sampleSizeLevels}
            placeholder="Select Sample Size"
            className="h-14 rounded-2xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
          />
        </div>

        {/* Accept Limit */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <CheckSquare size={14} className="text-emerald-500" />
            Accept Limit (Ac)
          </label>
          <Input
            name="acceptLimit"
            type="number"
            min="0"
            value={formData.acceptLimit}
            onChange={handleChange}
            placeholder="0"
            className="h-14 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* Reject Limit */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
            <XSquare size={14} className="text-rose-500" />
            Reject Limit (Re)
          </label>
          <Input
            name="rejectLimit"
            type="number"
            min="0"
            value={formData.rejectLimit}
            onChange={handleChange}
            placeholder="0"
            className="h-14 rounded-2xl border-slate-200 focus:border-rose-500 focus:ring-rose-500/20"
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">AQL Quick Reference</h4>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            AQL is a statistical measure used in quality control. For most consumer goods, AQL 2.5 (major defects) and 4.0 (minor defects) are the industry standard.
          </p>
        </div>
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
          className="h-14 px-10 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 shadow-lg"
        >
          Continue to Overview
        </Button>
      </div>
    </div>
  );
};

export default AQLStep;
