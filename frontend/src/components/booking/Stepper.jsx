import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { cn } from '../../utils/cn';

const Stepper = () => {
  const { currentStep, steps, goToStep } = useBooking();

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full py-6">
      {/* Desktop Stepper */}
      <div className="hidden md:block relative">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={step.id} className="relative flex flex-col items-center flex-1 group">
                {/* Connector Line (Left) */}
                {index !== 0 && (
                  <div className={cn(
                    "absolute left-0 right-1/2 top-5 h-0.5 -translate-x-1/2 transition-all duration-500",
                    isCompleted ? "bg-indigo-600" : "bg-slate-200"
                  )} />
                )}
                
                {/* Connector Line (Right) */}
                {index !== steps.length - 1 && (
                  <div className={cn(
                    "absolute left-1/2 right-0 top-5 h-0.5 translate-x-1/2 transition-all duration-500",
                    isCompleted || (isActive && currentStep > index) ? "bg-indigo-600" : "bg-slate-200"
                  )} />
                )}

                <button
                  onClick={() => index <= currentStep && goToStep(index)}
                  disabled={index > currentStep}
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                    isCompleted 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : isActive 
                        ? "bg-white text-indigo-600 border-2 border-indigo-600 ring-4 ring-indigo-50"
                        : "bg-white text-slate-400 border-2 border-slate-200"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    index + 1
                  )}
                </button>
                
                <span className={cn(
                  "mt-3 text-xs font-bold tracking-tight uppercase transition-all duration-300",
                  isActive ? "text-indigo-600" : isCompleted ? "text-slate-800" : "text-slate-400"
                )}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper / Progress Bar */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</p>
            <h2 className="text-lg font-bold text-slate-800">{steps[currentStep]?.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-indigo-600">{Math.round(progress)}%</p>
          </div>
        </div>
        
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Desktop Sub-heading with Progress */}
      <div className="hidden md:flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
            {currentStep + 1}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{steps[currentStep]?.name}</h3>
            <p className="text-sm text-slate-500 font-medium">Please provide the necessary details for this step</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{Math.round(progress)}% Complete</span>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
