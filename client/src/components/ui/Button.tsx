import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon,
  haptic = 'light',
  onClick,
  className = '',
  type = 'button',
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    if (haptic !== 'none') {
      triggerHaptic(haptic === 'heavy' ? 'heavy' : haptic === 'medium' ? 'medium' : 'light');
    }
    if (onClick) onClick(e);
  };

  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px] gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm min-h-[44px] gap-2', // ≥44px mobile touch target
    lg: 'px-5 py-3 text-sm sm:text-base min-h-[48px] gap-2.5 font-black', // ≥48px primary action
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 focus:ring-cyan-400',
    secondary:
      'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/80 focus:ring-slate-500',
    success:
      'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black hover:from-emerald-400 hover:to-teal-500 shadow-md shadow-emerald-500/20 focus:ring-emerald-400',
    danger:
      'bg-gradient-to-r from-rose-500 to-red-600 text-white font-black hover:from-rose-400 hover:to-red-500 shadow-md shadow-rose-500/20 focus:ring-rose-400',
    ghost:
      'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/60 focus:ring-slate-600',
    outline:
      'bg-transparent text-slate-200 border border-slate-700 hover:bg-slate-800/80 hover:border-slate-600 focus:ring-cyan-500',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Attendere...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
