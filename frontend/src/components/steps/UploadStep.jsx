import { useBooking } from '../../hooks/useBooking';
import { FileUpload, Alert } from '../ui';
import { StepNavigation } from '../booking';
import { FileText } from 'lucide-react';

const UploadStep = () => {
  const { bookingData, setFiles, removeFile, prevStep, nextStep } = useBooking();

  const handleFilesSelected = (files, isMultiple) => {
    if (isMultiple) {
      setFiles([...bookingData.files, ...files]);
    } else {
      setFiles([...bookingData.files, files[0]]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Documents</h2>
        <p className="text-slate-500 font-medium">
          Upload your product specification or inspection checklist.{' '}
          <strong>PDF documents only</strong> — max 10 MB each, up to 5 files.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {bookingData.files.length > 0 && (
          <Alert type="info">
            <strong>{bookingData.files.length} file{bookingData.files.length > 1 ? 's' : ''}</strong>{' '}
            uploaded
          </Alert>
        )}

        <FileUpload
          onFilesSelected={handleFilesSelected}
          existingFiles={bookingData.files}
          onRemoveFile={(id) => removeFile(id)}
          multiple
          maxFiles={5}
          accept=".pdf"
          maxSize={10 * 1024 * 1024}
        />
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={nextStep}
        nextLabel="Continue to Factory"
      />
    </div>
  );
};

export default UploadStep;
