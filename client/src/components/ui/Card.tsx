import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  className = '',
  ...rest
}) => {
  const isClickable = interactive || Boolean(onClick);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClickable) {
      triggerHaptic('light');
    }
    if (onClick) onClick(e);
  };

  const baseStyles = 'rounded-2xl transition-all duration-200 overflow-hidden';

  const variantStyles = {
    default: 'bg-slate-900/90 border border-slate-800/90 shadow-lg',
    elevated: 'bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40',
    glass: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl',
    interactive:
      'bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer active:scale-[0.99] shadow-lg',
  }[variant];

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }[padding];

  return (
    <div
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles} ${paddingStyles} ${
        isClickable && variant !== 'interactive'
          ? 'cursor-pointer hover:border-slate-700 active:scale-[0.99]'
          : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div
    className={`flex items-center justify-between pb-3 border-b border-slate-800/80 gap-3 ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <h3 className={`font-black text-white text-xs sm:text-sm tracking-wide ${className}`} {...rest}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`pt-3 ${className}`} {...rest}>
    {children}
  </div>
);
