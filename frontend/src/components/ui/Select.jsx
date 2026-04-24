import { forwardRef } from 'react';

/**
 * Select dropdown component
 * @param {Object} props
 */
const Select = forwardRef(
  (
    {
      label,
      error,
      className = '',
      wrapperClassName = '',
      required = false,
      options = [],
      placeholder = 'Select an option',
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
        <select
          ref={ref}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option
              key={option.id || option.value}
              value={option.value || option.id}
              disabled={option.disabled}
            >
              {option.label || option.name}
            </option>
          ))}
        </select>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
