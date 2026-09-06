import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base font-semibold'
    };

    const variantStyles = {
      primary:
        'bg-gradient-brand text-white shadow-glow-brand hover:brightness-110 hover:shadow-cyan-500/30 active:brightness-95',
      secondary:
        'bg-[#0B1026] text-white border border-[#1C2450] hover:border-[#2A3777] hover:bg-[#10173A]',
      outline:
        'bg-transparent text-white border border-[#1C2450] hover:border-[#00D9FF] hover:text-[#00D9FF]',
      ghost:
        'bg-transparent text-[#AAB3D0] hover:text-white hover:bg-white/5',
      danger:
        'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
