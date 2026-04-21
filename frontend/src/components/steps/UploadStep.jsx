import { useBooking } from '../../hooks/useBooking';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

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
        <Button type="button" variant="secondary" onClick={prevStep}>
          Back
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continue to Factory
        </Button>
      </div>
    </div>
  );
};

export default UploadStep;
