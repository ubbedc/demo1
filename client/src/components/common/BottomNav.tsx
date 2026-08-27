import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../utils/haptics';
import { 
  LineChart, 
  Clock, 
  Receipt, 
  Home, 
  Sparkles, 
  Lock, 
  Activity, 
  Users, 
  LogOut,
  Zap,
  GraduationCap 
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
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleNavClick = (viewName: string) => {
    triggerHaptic('light');
    setActiveView(viewName);
  };

  // 1. PUBLIC GUEST MODE (Landing Page & Academy)
  if (!user) {
    return (
      <nav 
        aria-label="Navigazione Mobile Pubblica"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-1 shadow-[0_-12px_30px_rgba(0,0,0,0.7)] select-none"
      >
        {/* Home */}
        <button
          type="button"
          onClick={() => {
            handleNavClick('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'landing'
              ? 'text-cyan-400 bg-cyan-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Home</span>
        </button>

        {/* Quant Academy */}
        <button
          type="button"
          onClick={() => handleNavClick('academy')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'academy'
              ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 font-black shadow-md shadow-emerald-500/20'
              : 'text-emerald-400/90 hover:text-emerald-300'
          }`}
        >
          <Zap className="w-5 h-5 mb-1 text-emerald-400" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Academy</span>
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
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-200 active:scale-95"
        >
          <Activity className="w-5 h-5 mb-1 text-cyan-400" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Mercati</span>
        </button>

        {/* Login / Registrati */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            if (onOpenAuth) onOpenAuth('register');
          }}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-black transition-all cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          <Sparkles className="w-5 h-5 mb-1 text-cyan-400" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Accedi</span>
        </button>
      </nav>
    );
  }

  // 2. ADMIN & CRM DESK OPERATOR MODE
  if (isAdmin) {
    return (
      <nav 
        aria-label="Navigazione Desk Amministratore"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-1 shadow-[0_-12px_30px_rgba(0,0,0,0.7)] select-none"
      >
        {/* Terminale */}
        <button
          type="button"
          onClick={() => handleNavClick('trading')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'trading'
              ? 'text-cyan-400 bg-cyan-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChart className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Terminale</span>
        </button>

        {/* CRM Desk */}
        <button
          type="button"
          onClick={() => handleNavClick('admin')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeView.startsWith('admin')
              ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40 font-black shadow-md shadow-amber-500/20'
              : 'text-amber-400/80 hover:text-amber-300'
          }`}
        >
          <Users className="w-5 h-5 mb-1 text-amber-400" />
          <span className="text-[10px] font-mono tracking-tight leading-none">CRM Desk</span>
        </button>

        {/* Academy */}
        <button
          type="button"
          onClick={() => handleNavClick('academy')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'academy'
              ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 font-black shadow-md shadow-emerald-500/20'
              : 'text-emerald-400/80 hover:text-emerald-300'
          }`}
        >
          <Zap className="w-5 h-5 mb-1 text-emerald-400" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Academy</span>
        </button>

        {/* Ordini */}
        <button
          type="button"
          onClick={() => handleNavClick('orders')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'orders'
              ? 'text-cyan-400 bg-cyan-500/10 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-mono tracking-tight leading-none">Ordini</span>
        </button>
      </nav>
    );
  }

  // 3. LOGGED-IN CLIENT TRADER MODE
  return (
    <nav 
      aria-label="Navigazione Terminale Cliente"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-1 shadow-[0_-12px_30px_rgba(0,0,0,0.7)] select-none"
    >
      {/* Terminale Live */}
      <button
        type="button"
        onClick={() => handleNavClick('trading')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
          activeView === 'trading'
            ? 'text-cyan-400 bg-cyan-500/10 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {openPositionsCount > 0 && (
          <span className="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
            {openPositionsCount}
          </span>
        )}
        <LineChart className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-mono tracking-tight leading-none">Terminale</span>
      </button>

      {/* Academy HTB */}
      <button
        type="button"
        onClick={() => handleNavClick('academy')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeView === 'academy'
            ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 font-black shadow-md shadow-emerald-500/20'
            : 'text-emerald-400/80 hover:text-emerald-300'
        }`}
      >
        <Zap className="w-5 h-5 mb-1 text-emerald-400" />
        <span className="text-[10px] font-mono tracking-tight leading-none">Academy</span>
      </button>

      {/* Storico Ordini */}
      <button
        type="button"
        onClick={() => handleNavClick('orders')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeView === 'orders'
            ? 'text-cyan-400 bg-cyan-500/10 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Clock className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-mono tracking-tight leading-none">Ordini</span>
      </button>

      {/* Estratto Conto */}
      <button
        type="button"
        onClick={() => handleNavClick('transactions')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeView === 'transactions'
            ? 'text-cyan-400 bg-cyan-500/10 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Receipt className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-mono tracking-tight leading-none">Estratto</span>
      </button>
    </nav>
  );
};
