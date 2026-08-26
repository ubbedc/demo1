import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../utils/haptics';
import { 
  LineChart, 
  Clock, 
  Receipt, 
  Shield, 
  Home, 
  Sparkles, 
  Lock, 
  Activity, 
  Users, 
  Zap, 
  FileDown 
} from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  setActiveView: (view: any) => void;
  openPositionsCount: number;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  setActiveView,
  openPositionsCount,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleNavClick = (viewName: string) => {
    triggerHaptic('light');
    setActiveView(viewName);
  };

  // 1. Logged Out Visitor Mobile Tab Bar (Native App Style)
  if (!user) {
    return (
      <nav 
        aria-label="Navigazione Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.5)] select-none"
      >
        {/* Home */}
        <button
          type="button"
          onClick={() => {
            handleNavClick('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeView === 'landing'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-tight">Home</span>
        </button>

        {/* Live Markets */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveView('landing');
            const el = document.getElementById('market-preview-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-slate-200"
        >
          <Activity className="w-5 h-5 mb-0.5 text-cyan-400" />
          <span className="text-[10px] font-mono tracking-tight">Mercati</span>
        </button>

        {/* Register CTA Button (Pulsing highlight) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            if (onOpenAuth) onOpenAuth('register');
          }}
          className="flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-black scale-105 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-cyan-400" />
          <span className="text-[10px] font-mono tracking-tight">Attiva</span>
        </button>

        {/* Login */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            if (onOpenAuth) onOpenAuth('login');
          }}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-slate-200 active:scale-95"
        >
          <Lock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-tight">Accedi</span>
        </button>
      </nav>
    );
  }

  // 2. Logged In Admin / Desk Tab Bar
  if (isAdmin) {
    return (
      <nav 
        aria-label="Navigazione Desk Amministratore"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.5)] select-none"
      >
        {/* Terminale */}
        <button
          type="button"
          onClick={() => handleNavClick('trading')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'trading'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-tight">Terminale</span>
        </button>

        {/* CRM Clienti */}
        <button
          type="button"
          onClick={() => handleNavClick('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'admin'
              ? 'text-amber-300 bg-amber-500/15 border border-amber-500/40 font-black scale-105 shadow-md shadow-amber-500/20'
              : 'text-amber-400/80 hover:text-amber-300'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[10px] font-mono tracking-tight">Clienti CRM</span>
        </button>

        {/* Ordini */}
        <button
          type="button"
          onClick={() => handleNavClick('orders')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'orders'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-tight">Ordini</span>
        </button>

        {/* Ledger */}
        <button
          type="button"
          onClick={() => handleNavClick('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'transactions'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-tight">Audit</span>
        </button>
      </nav>
    );
  }

  // 3. Logged In Standard Client Tab Bar
  return (
    <nav 
      aria-label="Navigazione Terminale Cliente"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.5)] select-none"
    >
      {/* Terminale Live */}
      <button
        type="button"
        onClick={() => handleNavClick('trading')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative active:scale-95 ${
          activeView === 'trading'
            ? 'text-cyan-400 bg-cyan-500/10 font-black scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {openPositionsCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
            {openPositionsCount}
          </span>
        )}
        <LineChart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-mono tracking-tight">Terminale</span>
      </button>

      {/* Storico Ordini */}
      <button
        type="button"
        onClick={() => handleNavClick('orders')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeView === 'orders'
            ? 'text-cyan-400 bg-cyan-500/10 font-black scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Clock className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-mono tracking-tight">Ordini</span>
      </button>

      {/* Estratto Conto Ledger */}
      <button
        type="button"
        onClick={() => handleNavClick('transactions')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeView === 'transactions'
            ? 'text-cyan-400 bg-cyan-500/10 font-black scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Receipt className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-mono tracking-tight">Estratto</span>
      </button>
    </nav>
  );
};
