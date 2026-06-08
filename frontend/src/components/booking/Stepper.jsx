import React from 'react';
import { useBooking } from '../../hooks/useBooking';
import { cn } from '../../utils/cn';

const Stepper = () => {
  const { currentStep, steps, goToStep } = useBooking();
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="create-booking-sticky-header -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 px-6 lg:px-8 py-4 bg-av-background border-b border-av-border sticky top-16 z-30 shadow-sm">

      {/* Breadcrumb & Title */}
      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Dashboard &gt; Create Booking
        </p>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
          Create Booking
        </h1>
      </div>

      {/* Stepper (Horizontal Scroll) */}
      <div className="booking-stepper flex gap-2.5 overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <button
              key={step.id}
              onClick={() => index <= currentStep && goToStep(index)}
              disabled={index > currentStep}
              className={cn(
                "step-item flex items-center gap-2 min-w-max px-3.5 py-2 rounded-full text-[13px] font-semibold border transition-colors",
                isActive
                  ? "bg-av-orange text-white border-av-orange shadow-sm"
                  : isCompleted
                    ? "bg-av-navy text-white border-av-navy shadow-sm"
                    : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50 cursor-not-allowed"
              )}
            >
              <span className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold",
                isActive ? "bg-white/20 text-white" : isCompleted ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
              )}>
                {index + 1}
              </span>
              {step.name}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-[11px] font-bold text-av-orange uppercase tracking-widest">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-av-orange transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
};

export default Stepper;
