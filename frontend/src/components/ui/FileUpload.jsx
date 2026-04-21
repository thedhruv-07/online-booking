import { useCallback, useState } from 'react';
import { formatFileSize } from '../../utils/helpers';

/**
 * File upload component with drag-and-drop support
 * @param {Object} props
 */
const FileUpload = ({
  onFilesSelected,
  multiple = false,
  maxFiles = 5,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB
  existingFiles = [],
  onRemoveFile,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size exceeds ${maxSize / 1024 / 1024}MB`);
        return;
      }

      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      if (!acceptedTypes.some((type) => fileExt.match(new RegExp(type.replace('.', '\\.') + '$')))) {
        errors.push(`${file.name}: File type not allowed`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      const { validFiles, errors: validationErrors } = validateFiles(files);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 5000);
      }

      if (validFiles.length > 0) {
        const filesWithId = validFiles.map((file) => ({
          file,
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        }));
        onFilesSelected(filesWithId, multiple);
      }
    },
    [onFilesSelected, multiple, maxSize, accept]
  );

  const handleInputChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (!files.length) return;

      const { validFiles, errors: validationErrors } = validateFiles(files);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 5000);
      }

      if (validFiles.length > 0) {
        const filesWithId = validFiles.map((file) => ({
          file,
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        }));
        onFilesSelected(filesWithId, multiple);
      }

      // Reset input
      e.target.value = '';
    },
    [onFilesSelected, multiple, maxSize, accept]
  );

  const removeFile = (fileId) => {
    if (onRemoveFile) {
      onRemoveFile(fileId);
    }
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-input-${className}`).click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          id={`file-input-${className}`}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-semibold text-blue-600 hover:text-blue-500">
            Click to upload
          </span>{' '}
          or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOC, DOCX, JPG, PNG up to {maxSize / 1024 / 1024}MB
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Existing files list */}
      {existingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              {onRemoveFile && (
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
