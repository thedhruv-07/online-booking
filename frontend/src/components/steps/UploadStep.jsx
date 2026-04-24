import { useBooking } from '../../hooks/useBooking';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Step 4: File Upload
 */
const UploadStep = () => {
  const { bookingData, setFiles, removeFile, prevStep, nextStep } = useBooking();

  const handleFilesSelected = (files, isMultiple) => {
    if (isMultiple) {
      setFiles([...bookingData.files, ...files]);
    } else {
      setFiles([...bookingData.files, files[0]]);
    }
  };

  const handleRemoveFile = (fileId) => {
    removeFile(fileId);
  };

  const handleContinue = () => {
    if (bookingData.files.length === 0) {
      // Could show an error, but allowing to continue
    }
    nextStep();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>
      <p className="text-gray-600 mb-6">
        Upload product specifications, drawings, or other documents related to your inspection.
      </p>

      {bookingData.files.length > 0 && (
        <Alert type="info" className="mb-4">
          <strong>Files Selected:</strong> {bookingData.files.length} file(s) uploaded
        </Alert>
      )}

      <FileUpload
        onFilesSelected={handleFilesSelected}
        existingFiles={bookingData.files}
        onRemoveFile={handleRemoveFile}
        multiple
        maxFiles={5}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="mb-6"
      />

      <div className="mt-8 flex justify-between">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={prevStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button 
          type="button" 
          onClick={handleContinue}
          className="flex items-center gap-2"
        >
          Continue to Factory
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default UploadStep;
