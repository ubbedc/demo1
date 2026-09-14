import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps<T extends string = string> {
  options: TabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function Tabs<T extends string = string>({
  options,
  activeId,
  onChange,
  size = 'md',
  fullWidth = true,
  className = '',
}: TabsProps<T>) {
  const handleSelect = (id: T) => {
    if (id !== activeId) {
      triggerHaptic('light');
      onChange(id);
    }
  };

  const sizeStyles = {
    sm: 'p-1 gap-1 text-xs',
    md: 'p-1.5 gap-1.5 text-xs sm:text-sm',
  }[size];

  const buttonSizeStyles = {
    sm: 'py-1.5 px-2.5 min-h-[36px]',
    md: 'py-2 px-3.5 min-h-[44px]', // ≥44px touch target
  }[size];

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800 select-none ${sizeStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {options.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.id)}
            className={`flex-1 inline-flex items-center justify-center font-mono font-bold rounded-xl transition-all duration-150 cursor-pointer ${buttonSizeStyles} ${
              isActive
                ? 'bg-slate-800 text-cyan-300 shadow-md border border-slate-700/80 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {tab.icon && <span className="mr-2 shrink-0">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
