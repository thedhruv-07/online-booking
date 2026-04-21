import { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

/**
 * Step 6: Contact Information
 */
const ContactStep = () => {
  const { updateStepData, bookingData, prevStep, nextStep } = useBooking();
  const [formData, setFormData] = useState({
    name: bookingData.contact?.name || '',
    email: bookingData.contact?.email || '',
    phone: bookingData.contact?.phone || '',
    company: bookingData.contact?.company || '',
    notes: bookingData.contact?.notes || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStepData('contact', formData);
    nextStep();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
      <p className="text-gray-600 mb-6">
        Provide your contact details so we can reach you regarding this booking.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            required
          />

          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your Company Ltd."
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Additional Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requirements or information..."
            rows={4}
          />
        </div>

        <div className="mt-8 flex justify-between">
          <Button type="button" variant="secondary" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">Continue to AQL</Button>
        </div>
      </form>
    </div>
  );
};

export default ContactStep;
