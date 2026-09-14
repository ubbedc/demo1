import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`py-10 px-4 text-center font-mono flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-bold text-slate-200">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
