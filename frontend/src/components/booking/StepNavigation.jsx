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
          onClick={onBack}
          className="btn-secondary px-10 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </Button>
      )}
      
      <div className={isFirstStep ? "w-full flex justify-end" : ""}>
        <Button 
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="btn-primary px-12 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {nextLabel}
          {!isLastStep && <ArrowRight size={18} />}
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
