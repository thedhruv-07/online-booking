import { forwardRef } from 'react';

/**
 * Reusable Input component with label and error handling
 * @param {Object} props
 */
const Input = forwardRef(
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
        <input
          ref={ref}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
