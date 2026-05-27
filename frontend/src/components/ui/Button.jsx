import { forwardRef } from 'react';

/**
 * Reusable Button component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'success'} props.variant
 * @param {boolean} props.loading
 * @param {ReactNode} props.children
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0';

    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500/20 shadow-xl shadow-indigo-100',
      secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-500/10 shadow-sm',
      danger: 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 focus:ring-rose-500/10',
      success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500/20 shadow-xl shadow-emerald-100',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-indigo-500/10',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-8 py-3 text-sm',
      lg: 'px-10 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
