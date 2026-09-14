import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[90vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      triggerHaptic('medium');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
      />

      {/* Sheet / Drawer Container */}
      <div
        className={`relative z-10 w-full sm:max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col ${maxHeight} animate-slide-up pb-[max(1rem,env(safe-area-inset-bottom))]`}
      >
        {/* Handle Bar (Mobile Only) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-base font-black text-white font-mono tracking-tight flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono">
          {children}
        </div>
      </div>
    </div>
  );
};
