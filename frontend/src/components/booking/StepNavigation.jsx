import React from 'react';
import Button from '../ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * ✅ Reusable Navigation for Booking Steps
 */
const StepNavigation = ({ 
  onBack, 
  onNext, 
  backLabel = "Back", 
  nextLabel = "Continue",
  isFirstStep = false,
  isLastStep = false,
  isValid = true,
  className = ""
}) => {
  return (
    <div className={`pt-8 flex flex-col sm:flex-row justify-between gap-4 max-w-4xl mx-auto w-full ${className}`}>
      {!isFirstStep && (
        <Button 
          type="button" 
          variant="secondary" 
          size="sm"
          onClick={onBack}
          className="!font-medium !px-4 !py-1.5 flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Button>
      )}

      <div className={isFirstStep ? "w-full flex justify-end" : ""}>
        <Button 
          type="button"
          variant="primary"
          size="sm"
          onClick={onNext}
          disabled={!isValid}
          className="!font-medium !px-5 !py-1.5 flex items-center justify-center gap-1.5 w-full sm:w-auto"
        >
          {nextLabel}
          {!isLastStep && <ArrowRight size={14} />}
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
