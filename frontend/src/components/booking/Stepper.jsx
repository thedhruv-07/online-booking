import { useBooking } from '../../hooks/useBooking';
import { BOOKING_STEPS } from '../../utils/constants';

/**
 * Multi-step form stepper component
 */
const Stepper = () => {
  const { currentStep, steps, goToStep } = useBooking();


  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  const isStepAccessible = (stepIndex) => {
    // Allow accessing previous steps and current step
    return stepIndex <= currentStep;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const accessible = isStepAccessible(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => accessible && goToStep(index)}

                  disabled={!accessible}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                    status === 'completed'
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : status === 'active'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  } ${accessible ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  title={step.name}
                >
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Step label - hidden on small screens */}
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block ${
                    status === 'active' ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step indicator */}
      <div className="mt-4 sm:hidden">
        <p className="text-center text-sm font-medium text-blue-600">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.name}
        </p>
      </div>

      {/* Progress bar (desktop) */}
      <div className="hidden sm:block mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Progress: {currentStep + 1} of {steps.length} steps
          </span>
          <span className="text-gray-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Stepper;
