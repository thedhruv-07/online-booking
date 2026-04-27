import { useState, useEffect } from 'react';
import { useBooking } from '../../hooks/useBooking';
import { Input, Select } from '../ui';
import { 
  Calculator,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  Info
} from 'lucide-react';
import { StepNavigation } from '../booking';
import { getAQLResult } from '../../utils/aql/aqlService.js';
import { cn } from '../../utils/cn';

const AQLStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  
  const [form, setForm] = useState({
    inspectionType: bookingData.aql?.inspectionType || 'General',
    inspectionLevel: bookingData.aql?.inspectionLevel || 'II',
    unitType: bookingData.aql?.unitType || 'Pieces',
    lotSize: bookingData.aql?.lotSize || bookingData.product?.quantity || '',
    piecesPerSet: bookingData.aql?.piecesPerSet || '1',
    majorAQL: bookingData.aql?.majorAQL || '2.5',
    minorAQL: bookingData.aql?.minorAQL || '4.0',
  });

  const [result, setResult] = useState({
    sampleSize: 0,
    major: 0,
    minor: 0,
    codeLetter: '-'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Debounce the calculation
    const timer = setTimeout(() => {
      const lotSize = Number(form.lotSize);
      const piecesPerSet = form.unitType === 'Pieces' ? 1 : Number(form.piecesPerSet);

      console.log('AQL Calculation Input:', { lotSize, piecesPerSet, form });

      if (!lotSize || lotSize <= 0 || !piecesPerSet || piecesPerSet < 1) {
        setResult({ sampleSize: 0, major: 0, minor: 0, codeLetter: '-' });
        return;
      }

      try {
        const res = getAQLResult({
          lotSize: lotSize,
          level: form.inspectionLevel,
          majorAQL: form.majorAQL,
          minorAQL: form.minorAQL,
        });

        console.log('AQL Calculation Result:', res);

        setResult({
          sampleSize: res.sampleSize,
          major: res.majorAccept,
          minor: res.minorAccept,
          codeLetter: res.codeLetter
        });
      } catch (err) {
        console.error('AQL Calculation Error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateStepData('aql', {
        ...form,
        ...result
      });
      nextStep();
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
          <Calculator size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">AQL Configuration</h2>
        <p className="text-slate-500 font-medium leading-relaxed group relative inline-flex items-center gap-2 cursor-help">
          Configure your ISO 2859-1 Acceptable Quality Limit
          <Info size={16} className="text-indigo-400" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none">
            AQL is based on the internationally recognized ISO 2859-1 standard for quality control sampling.
          </span>
        </p>
      </div>

      <div className="space-y-8">
        {/* Top: Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
            Inspection Parameters
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
              CALCULATE
            </button>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Select
              label="Inspection Type"
              name="inspectionType"
              value={form.inspectionType}
              onChange={(e) => {
                const val = e.target.value;
                setForm(prev => ({
                  ...prev,
                  inspectionType: val,
                  inspectionLevel: val === 'General' ? 'II' : 'S-2'
                }));
              }}
              options={[
                { value: 'General', label: 'General' },
                { value: 'Special', label: 'Special' }
              ]}
            />
            
            <Select
              label="Inspection Level"
              name="inspectionLevel"
              value={form.inspectionLevel}
              onChange={handleChange}
              options={form.inspectionType === 'General' ? [
                { value: 'I', label: 'Level I' },
                { value: 'II', label: 'Level II (Standard)' },
                { value: 'III', label: 'Level III' }
              ] : [
                { value: 'S-1', label: 'Level S-1' },
                { value: 'S-2', label: 'Level S-2 (Standard)' },
                { value: 'S-3', label: 'Level S-3' },
                { value: 'S-4', label: 'Level S-4' }
              ]}
            />

            <Select
              label="Type of Unit"
              name="unitType"
              value={form.unitType}
              onChange={handleChange}
              options={[
                { value: 'Pieces', label: 'Pieces' },
                { value: 'Sets', label: 'Sets' },
                { value: 'Cartons', label: 'Cartons' }
              ]}
            />

            <Input
              label="Order Quantity"
              type="number"
              name="lotSize"
              value={form.lotSize}
              onChange={handleChange}
              placeholder="e.g. 5000"
              min="1"
            />

            <Select
              label="Major Defect Limit"
              name="majorAQL"
              value={form.majorAQL}
              onChange={handleChange}
              options={[
                { value: '0.065', label: '0.065' },
                { value: '0.1', label: '0.1' },
                { value: '0.15', label: '0.15' },
                { value: '0.25', label: '0.25' },
                { value: '0.4', label: '0.4' },
                { value: '0.65', label: '0.65' },
                { value: '1.0', label: '1' },
                { value: '1.5', label: '1.5' },
                { value: '2.5', label: '2.5' },
                { value: '4.0', label: '4' },
                { value: '6.5', label: '6.5' }
              ]}
            />

            <Select
              label="Minor Defect Limit"
              name="minorAQL"
              value={form.minorAQL}
              onChange={handleChange}
              options={[
                { value: '0.065', label: '0.065' },
                { value: '0.1', label: '0.1' },
                { value: '0.15', label: '0.15' },
                { value: '0.25', label: '0.25' },
                { value: '0.4', label: '0.4' },
                { value: '0.65', label: '0.65' },
                { value: '1.0', label: '1' },
                { value: '1.5', label: '1.5' },
                { value: '2.5', label: '2.5' },
                { value: '4.0', label: '4' },
                { value: '6.5', label: '6.5' }
              ]}
            />

            <Input
              label="Pieces Per Set"
              type="number"
              name="piecesPerSet"
              value={form.piecesPerSet}
              onChange={handleChange}
              min="1"
              disabled={form.unitType === 'Pieces'}
              className={form.unitType === 'Pieces' ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
            />
          </div>
        </div>

        {/* Bottom: Results Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center shadow-sm relative overflow-hidden group">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">Sample Size</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {result.sampleSize > 0 ? result.sampleSize : '-'}
            </div>
            {result.codeLetter !== '-' && (
              <span className="text-[10px] text-indigo-500 font-bold mt-1 block bg-white/50 w-max mx-auto px-2 py-0.5 rounded-full">Code Letter: {result.codeLetter}</span>
            )}
          </div>

          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center shadow-sm relative overflow-hidden group">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">Major Defects</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {result.sampleSize > 0 ? result.major : '-'}
            </div>
            <span className="text-[10px] text-rose-500 font-bold mt-1 block bg-white/50 w-max mx-auto px-2 py-0.5 rounded-full">Allowed</span>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center shadow-sm relative overflow-hidden group">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">Minor Defects</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {result.sampleSize > 0 ? result.minor : '-'}
            </div>
            <span className="text-[10px] text-amber-500 font-bold mt-1 block bg-white/50 w-max mx-auto px-2 py-0.5 rounded-full">Allowed</span>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <StepNavigation 
          onBack={prevStep}
          onNext={handleContinue}
          isValid={!isSaving && Number(form.lotSize) > 0 && (form.unitType === 'Pieces' || Number(form.piecesPerSet) > 0)}
          nextLabel={isSaving ? "Saving..." : "Save & Continue"}
        />
      </div>
    </div>
  );
};

export default AQLStep;
