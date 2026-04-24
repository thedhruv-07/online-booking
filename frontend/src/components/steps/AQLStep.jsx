import { useState, useEffect } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { 
  PackageSearch,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  Zap,
  Shield,
  Star,
  Activity,
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info
} from 'lucide-react';
import { calculateAQL } from '../../utils/aqlCalculator';
import { cn } from '../../utils/cn';

const STRICTNESS_MAP = {
  basic: 'i',
  standard: 'ii',
  high: 'iii'
};

const QUALITY_MAP = {
  basic: { major: '4.0', minor: '6.5' },
  standard: { major: '2.5', minor: '4.0' },
  high: { major: '1.5', minor: '2.5' }
};

/**
 * Step 7: Order Details & Quality Preferences
 * Premium SaaS-style client configuration
 */
const AQLStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  
  const initialLotSize = parseInt(bookingData.product?.quantity) || 1000;
  
  const [formData, setFormData] = useState({
    lotSize: bookingData.aql?.lotSize || initialLotSize,
    strictnessMode: bookingData.aql?.strictnessMode || 'standard',
    qualityMode: bookingData.aql?.qualityMode || 'standard',
  });

  const [calculation, setCalculation] = useState({
    sampleSize: 0,
    codeLetter: 'A',
    majorLimits: { ac: 0, re: 1 },
    minorLimits: { ac: 0, re: 1 }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lotSizeError, setLotSizeError] = useState('');
  const [showToast, setShowToast] = useState(true);

  // Auto hide default selection toast
  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate whenever inputs change
  useEffect(() => {
    const level = STRICTNESS_MAP[formData.strictnessMode];
    const { major, minor } = QUALITY_MAP[formData.qualityMode];
    
    const results = calculateAQL(formData.lotSize, level, major, minor);
    setCalculation(results);

    // Clear error if lot size is valid
    if (formData.lotSize > 0) {
      setLotSizeError('');
    }
  }, [formData.lotSize, formData.strictnessMode, formData.qualityMode]);

  const handleLotSizeChange = (e) => {
    const value = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
    setFormData(prev => ({ ...prev, lotSize: value }));
  };

  const handleContinue = () => {
    if (!formData.lotSize || formData.lotSize <= 0) {
      setLotSizeError('Please enter total lot size');
      return;
    }

    setIsSaving(true);

    // Simulate small network delay for premium feel
    setTimeout(() => {
      const payload = {
        ...formData,
        inspectionLevel: STRICTNESS_MAP[formData.strictnessMode],
        aqlMajor: QUALITY_MAP[formData.qualityMode].major,
        aqlMinor: QUALITY_MAP[formData.qualityMode].minor,
        sampleSize: calculation.sampleSize,
        codeLetter: calculation.codeLetter,
        majorLimits: calculation.majorLimits,
        minorLimits: calculation.minorLimits
      };
      
      updateStepData('aql', payload);
      nextStep();
      setIsSaving(false);
    }, 400);
  };

  const SelectionCard = ({ selected, onClick, icon: Icon, title, description, recommended, customBadge }) => (
    <div 
      onClick={onClick}
      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col h-full bg-white hover:scale-[1.02] hover:shadow-lg ${
        selected 
          ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-4 ring-indigo-50' 
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 whitespace-nowrap">
          Recommended
        </span>
      )}
      {customBadge && !recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 whitespace-nowrap">
          {customBadge}
        </span>
      )}
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${selected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
        <Icon size={24} />
      </div>
      <h4 className={`font-bold mb-2 text-lg ${selected ? 'text-indigo-900' : 'text-slate-800'}`}>{title}</h4>
      <p className={`text-sm leading-relaxed font-medium ${selected ? 'text-indigo-700/80' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-12 relative">
      {/* Recommended Toast */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-50 transition-all duration-500 flex items-center gap-2 pointer-events-none ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <CheckSquare size={16} className="text-emerald-400" />
        Recommended settings are pre-selected for you
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Quality Preferences</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Select how strict you want the inspection to be. We handle all the statistical calculations automatically.
        </p>
      </div>

      <div className="space-y-14">
        {/* Section 1: Order Details */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <PackageSearch size={18} className="text-indigo-500" />
              1. Order Details
            </h3>
          </div>
          <div className={`bg-white p-6 rounded-3xl border shadow-sm max-w-md transition-colors ${lotSizeError ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'}`}>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Total Lot Size (Units)</label>
            <Input
              type="number"
              name="lotSize"
              value={formData.lotSize}
              onChange={handleLotSizeChange}
              className={cn(
                "rounded-md text-lg font-bold",
                lotSizeError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
              )}
              placeholder="e.g. 10000"
            />
            {lotSizeError && (
              <p className="text-red-500 text-sm font-semibold mt-2 flex items-center gap-1">
                <AlertTriangle size={14} />
                {lotSizeError}
              </p>
            )}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 2: Inspection Strictness */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" />
              2. Inspection Strictness
            </h3>
            <div className="group relative cursor-help">
              <Info size={16} className="text-slate-400 hover:text-indigo-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                This setting controls how strict the inspection process will be by adjusting the sample size.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectionCard
              selected={formData.strictnessMode === 'basic'}
              onClick={() => setFormData(prev => ({ ...prev, strictnessMode: 'basic' }))}
              icon={Zap}
              title="Basic"
              description="Faster inspection with smaller sample size."
              customBadge="Fastest"
            />
            <SelectionCard
              selected={formData.strictnessMode === 'standard'}
              onClick={() => setFormData(prev => ({ ...prev, strictnessMode: 'standard' }))}
              icon={Layers}
              title="Standard"
              description="Balanced approach for most businesses."
              recommended
            />
            <SelectionCard
              selected={formData.strictnessMode === 'high'}
              onClick={() => setFormData(prev => ({ ...prev, strictnessMode: 'high' }))}
              icon={Shield}
              title="High"
              description="Maximum confidence with larger inspection sample."
              customBadge="Most Accurate"
            />
          </div>
        </section>

        {/* Section 3: Quality Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Star size={18} className="text-indigo-500" />
              3. Quality Level
            </h3>
            <div className="group relative cursor-help">
              <Info size={16} className="text-slate-400 hover:text-indigo-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                This controls the tolerance for minor cosmetic defects.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectionCard
              selected={formData.qualityMode === 'basic'}
              onClick={() => setFormData(prev => ({ ...prev, qualityMode: 'basic' }))}
              icon={CheckSquare}
              title="Basic Check"
              description="Suitable for low-cost or bulk products."
            />
            <SelectionCard
              selected={formData.qualityMode === 'standard'}
              onClick={() => setFormData(prev => ({ ...prev, qualityMode: 'standard' }))}
              icon={ShieldCheck}
              title="Standard Quality"
              description="Recommended for most consumer goods."
              recommended
            />
            <SelectionCard
              selected={formData.qualityMode === 'high'}
              onClick={() => setFormData(prev => ({ ...prev, qualityMode: 'high' }))}
              icon={Star}
              title="High Quality"
              description="Strict quality control for premium products."
            />
          </div>
        </section>

        {/* Section 4: Auto Calculated Summary - Premium Light Theme */}
        <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black flex items-center gap-2 mb-8 text-slate-900">
              📊 Inspection Summary
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              <ul className="space-y-4 flex-1 text-slate-600 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <li className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="font-semibold">Lot Size:</span>
                  <span className="font-bold text-slate-900">{formData.lotSize ? formData.lotSize.toLocaleString() : 0} units</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="font-semibold">Strictness:</span>
                  <span className="font-bold text-slate-900 capitalize">{formData.strictnessMode}</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                  <span className="font-semibold">Quality Level:</span>
                  <span className="font-bold text-slate-900 capitalize">{formData.qualityMode} Quality</span>
                </li>
              </ul>
              
              <div className="bg-indigo-600 p-8 rounded-3xl text-center w-full md:w-auto min-w-[240px] shrink-0 shadow-lg shadow-indigo-200 flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 block mb-2">Sample Size</span>
                <div className="text-6xl font-black text-white mb-2">{calculation.sampleSize}</div>
                <span className="text-sm font-semibold text-indigo-200">units to inspect</span>
              </div>
            </div>

            <p className="mt-8 text-indigo-900 font-bold flex items-center gap-3 bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
              <CheckSquare size={24} className="text-indigo-600 shrink-0" />
              Our inspector will check {calculation.sampleSize} units from your total batch.
            </p>
            
            <div className="mt-4 bg-red-50 border border-red-100 text-red-800 px-5 py-4 rounded-2xl text-sm font-medium flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 text-red-500 mt-0.5" />
              <p>
                <strong className="text-red-700 block mb-1">Critical Defects</strong>
                Critical safety or functional defects are not allowed. If found, the inspection will automatically fail regardless of quality settings.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="pt-10 flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={prevStep}
          className="btn-secondary px-8 flex items-center justify-center gap-2"
          disabled={isSaving}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleContinue}
          disabled={isSaving}
          className="btn-primary px-10 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight size={20} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AQLStep;
