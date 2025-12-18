import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const baseStyles = 'w-full px-4 py-2 bg-cosmic-deep border rounded-lg text-foreground placeholder-cosmic-silver/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const borderStyles = hasError
      ? 'border-danger focus:ring-danger'
      : 'border-cosmic-violet/30 focus:border-cosmic-violet focus:ring-cosmic-violet';

    const iconPaddingLeft = leftIcon ? 'pl-10' : '';
    const iconPaddingRight = rightIcon ? 'pr-10' : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmic-silver">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`${baseStyles} ${borderStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-silver">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${hasError ? 'text-danger' : 'text-cosmic-silver/70'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
