import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'cyan' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-md font-mono uppercase tracking-wider select-none';

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[9px] font-black',
    md: 'px-2.5 py-1 text-[11px] font-bold',
  }[size];

  const variantStyles = {
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    neutral: 'bg-slate-800 text-slate-400 border border-slate-700/60',
  }[variant];

  const dotColor = {
    success: 'bg-emerald-400',
    danger: 'bg-rose-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    cyan: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  }[variant];

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...rest}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
            ></span>
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
        </span>
      )}
      {children}
    </span>
  );
};
