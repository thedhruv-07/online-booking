import { useState, useEffect } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { Input } from '../ui';
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
  Info
} from 'lucide-react';
import { StepNavigation } from '../booking';
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
      className={`relative p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex flex-col h-full bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 ${
        selected 
          ? 'border-indigo-600 bg-indigo-50/20 shadow-xl shadow-indigo-100/20 ring-4 ring-indigo-500/5' 
          : 'border-slate-100 hover:border-indigo-200'
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-indigo-200 z-10 whitespace-nowrap">
          Recommended
        </span>
      )}
      {customBadge && !recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-slate-200 z-10 whitespace-nowrap">
          {customBadge}
        </span>
      )}
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${selected ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-500'}`}>
        <Icon size={28} />
      </div>
      <h4 className={`font-black mb-3 text-xl tracking-tight ${selected ? 'text-slate-900' : 'text-slate-800'}`}>{title}</h4>
      <p className={`text-sm leading-relaxed font-medium ${selected ? 'text-slate-600' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-16 relative">
      {/* Recommended Toast */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-full text-sm font-bold shadow-2xl z-50 transition-all duration-700 flex items-center gap-3 pointer-events-none border border-white/10 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckSquare size={14} className="text-white" strokeWidth={3} />
        </div>
        Recommended settings are pre-selected for you
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="mx-auto w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm border border-indigo-100">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">Quality Preferences</h2>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Select how strict you want the inspection to be. We handle all the statistical calculations automatically.
        </p>
      </div>

      <div className="space-y-20">
        {/* Section 1: Order Details */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PackageSearch size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              1. Order Details
            </h3>
          </div>
          <div className={`bg-white p-10 rounded-[2.5rem] border shadow-2xl shadow-slate-200/20 max-w-md transition-all duration-500 ${lotSizeError ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-100'}`}>
            <label className="text-xs font-black text-slate-500 mb-3 block uppercase tracking-widest">Total Lot Size (Units)</label>
            <Input
              type="number"
              name="lotSize"
              value={formData.lotSize}
              onChange={handleLotSizeChange}
              className={cn(
                "rounded-2xl text-2xl font-black h-16 px-6",
                lotSizeError ? 'border-red-200 focus:border-red-500 focus:ring-red-50' : 'border-slate-100 focus:border-indigo-500 focus:ring-indigo-50'
              )}
              placeholder="e.g. 10,000"
            />
            {lotSizeError && (
              <p className="text-red-600 text-sm font-bold mt-4 flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertTriangle size={16} />
                {lotSizeError}
              </p>
            )}
          </div>
        </section>

        {/* Section 2: Inspection Strictness */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              2. Inspection Strictness
            </h3>
            <div className="group relative cursor-help">
              <Info size={16} className="text-slate-400 hover:text-indigo-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-slate-900 text-white text-xs rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-2xl pointer-events-none border border-white/10 leading-relaxed font-medium">
                This setting controls how strict the inspection process will be by adjusting the sample size based on statistical tables.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              description="Maximum confidence with larger sample."
              customBadge="Most Accurate"
            />
          </div>
        </section>

        {/* Section 3: Quality Preferences */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Star size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              3. Quality Level
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              description="Strict control for premium products."
            />
          </div>
        </section>

        {/* Section 4: Auto Calculated Summary - Premium Light Theme */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none opacity-60"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Inspection Summary
              </h3>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1 w-full">
                <ul className="space-y-4 text-slate-600">
                  <li className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                    <span className="font-semibold text-slate-400 uppercase tracking-widest text-[9px]">Lot Size</span>
                    <span className="font-bold text-slate-800 text-lg">{formData.lotSize ? formData.lotSize.toLocaleString() : 0} units</span>
                  </li>
                  <li className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                    <span className="font-semibold text-slate-400 uppercase tracking-widest text-[9px]">Inspection Level</span>
                    <span className="font-bold text-slate-800 text-lg uppercase">{formData.strictnessMode} ({calculation.codeLetter})</span>
                  </li>
                  <li className="flex justify-between items-center bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                    <span className="font-semibold text-indigo-500 uppercase tracking-widest text-[9px]">Acceptance Limit</span>
                    <span className="font-bold text-indigo-900 text-lg">Major {calculation.majorLimits.ac} / Minor {calculation.minorLimits.ac}</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-center w-full lg:w-auto min-w-[280px] shrink-0 shadow-2xl shadow-indigo-200 flex flex-col justify-center transform transition-transform hover:scale-105 duration-500">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-200/80 block mb-3">Final Sample Size</span>
                <div className="text-7xl font-bold text-white mb-3 tracking-tighter">{calculation.sampleSize}</div>
                <span className="text-base font-semibold text-white/90">Units to be Inspected</span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-100 p-7 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-3 mb-3 text-emerald-600">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                  <h4 className="font-bold uppercase tracking-widest text-[10px]">Quality Assurance</h4>
                </div>
                <p className="text-emerald-900/70 font-medium leading-relaxed text-sm">
                  Our inspector will randomly select {calculation.sampleSize} units from your total batch of {formData.lotSize?.toLocaleString()} for detailed verification.
                </p>
              </div>
              
              <div className="bg-rose-50 border border-rose-100 p-7 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-3 mb-3 text-rose-600">
                  <AlertTriangle size={20} strokeWidth={2.5} />
                  <h4 className="font-bold uppercase tracking-widest text-[10px]">Critical Safety</h4>
                </div>
                <p className="text-rose-900/70 font-medium leading-relaxed text-sm">
                  Zero tolerance for safety defects. If any critical functional or safety issue is found, the entire batch will fail automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="pt-10 border-t border-slate-100">
        <StepNavigation 
          onBack={prevStep}
          onNext={handleContinue}
          isValid={!isSaving && !!formData.lotSize && formData.lotSize > 0}
          nextLabel={isSaving ? "Saving..." : "Save & Continue"}
        />
      </div>
    </div>
  );
};

export default AQLStep;
