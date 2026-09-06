import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[#AAB3D0]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-[#080B1A] border ${
            error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-[#1C2450] focus:border-[#00D9FF] focus:ring-[#00D9FF]/20'
          } text-white placeholder:text-[#707B9E] text-sm transition-all outline-none focus:ring-2`}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#707B9E]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
