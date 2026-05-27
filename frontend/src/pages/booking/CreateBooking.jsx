import { useBooking } from '../../hooks/useBooking';
import { Stepper, BookingLayout } from '../../components/booking';
import {
  ServiceStep,
  LocationStep,
  ProductStep,
  UploadStep,
  FactoryStep,
  ContactStep,
  AQLStep,
  OverviewStep,
  PaymentStep,
} from '../../components/steps';

/**
 * Create Booking Page - Multi-step form wrapper
 */
const CreateBooking = () => {
  const { currentStep, steps } = useBooking();

  const renderStep = () => {
    switch (steps[currentStep]?.route) {
      case 'service':
        return <ServiceStep />;
      case 'location':
        return <LocationStep />;
      case 'product':
        return <ProductStep />;
      case 'upload':
        return <UploadStep />;
      case 'factory':
        return <FactoryStep />;
      case 'contact':
        return <ContactStep />;
      case 'aql':
        return <AQLStep />;
      case 'overview':
        return <OverviewStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <ServiceStep />;
    }
  };

  return (
    <>
      <Stepper />
      <div className="mt-6">
        {renderStep()}
      </div>
    </>
  );
};


export default CreateBooking;
