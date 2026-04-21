import { forwardRef } from 'react';

/**
 * Reusable Textarea component
 * @param {Object} props
 */
const Textarea = forwardRef(
  (
    {
      label,
      error,
      className = '',
      wrapperClassName = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`mb-4 ${wrapperClassName}`}>
        {label && (
          <label className="label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`input-field min-h-[100px] resize-y ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
