import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, DollarSign, X, Bell } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'trade_buy' | 'trade_sell' | 'trade_close' | 'funds';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  notify: (type: ToastType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API Institutional Chime Synthesizer
function playInstitutionalChime(type: ToastType) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'trade_buy' || type === 'funds') {
      // Ascending chime (Major triad)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'trade_sell' || type === 'trade_close') {
      // Dual resonant chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Soft ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (_) {}
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const notify = useCallback((type: ToastType, title: string, message: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    const newToast: ToastNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
    };

    playInstitutionalChime(type);

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Floating Toast Notification Stack (Top Right) */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let icon = <Bell className="w-4 h-4 text-cyan-400" />;
          let borderClass = 'border-cyan-500/40 bg-slate-900/95';

          if (toast.type === 'trade_buy') {
            icon = <TrendingUp className="w-4 h-4 text-emerald-400" />;
            borderClass = 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-950/40';
          } else if (toast.type === 'trade_sell') {
            icon = <TrendingDown className="w-4 h-4 text-rose-400" />;
            borderClass = 'border-rose-500/40 bg-slate-900/95 shadow-rose-950/40';
          } else if (toast.type === 'trade_close') {
            icon = <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
            borderClass = 'border-cyan-500/40 bg-slate-900/95 shadow-cyan-950/40';
          } else if (toast.type === 'funds') {
            icon = <DollarSign className="w-4 h-4 text-amber-400" />;
            borderClass = 'border-amber-500/40 bg-slate-900/95 shadow-amber-950/40';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl border ${borderClass} shadow-2xl backdrop-blur-md transition-all animate-fadeIn flex items-start gap-3 text-xs font-mono`}
            >
              <div className="p-1.5 rounded-lg bg-slate-950/80 shrink-0 mt-0.5">{icon}</div>

              <div className="flex-1 pr-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{toast.title}</span>
                  <span className="text-[10px] text-slate-500">{toast.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
