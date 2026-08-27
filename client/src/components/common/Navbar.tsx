import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { usePlatformSettings } from '../../context/PlatformSettingsContext';
import { PortfolioSummary } from '../../types';
import { Shield, RefreshCw, LogOut, LineChart, Sparkles } from 'lucide-react';

interface NavbarProps {
  portfolio: PortfolioSummary | null;
  activeView: string;
  setActiveView: (v: string) => void;
  onResetDemo: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  portfolio,
  activeView,
  setActiveView,
  onResetDemo,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();
  const { quotes, setSelectedSymbol, selectedSymbol } = useMarket();
  const { settings } = usePlatformSettings();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Dynamic Announcement Banner (if enabled in CMS) */}
      {settings.announcement_banner_enabled && settings.announcement_banner_text && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-b border-amber-500/30 py-1.5 px-4 text-center text-xs font-mono text-amber-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
          <span className="font-bold truncate">{settings.announcement_banner_text}</span>
        </div>
      )}

      {/* Top Ticker Marquee Bar - Touch Scrollable */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800/60 py-1.5 px-3 overflow-x-auto whitespace-nowrap text-xs font-mono flex items-center gap-4 no-scrollbar">
        <span className="text-cyan-400 font-bold flex items-center gap-1.5 shrink-0 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          LIVE FEED
        </span>
        {quotes.map((q) => {
          const isPos = q.change24h >= 0;
          const isSelected = q.symbol === selectedSymbol;
          return (
            <button
              key={q.symbol}
              onClick={() => setSelectedSymbol(q.symbol)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'hover:bg-slate-800/80 text-slate-300 bg-slate-950/40 border border-slate-800'
              }`}
            >
              <span className="font-bold">{q.symbol}</span>
              <span className="text-slate-100">
                ${q.last.toLocaleString(undefined, { minimumFractionDigits: q.assetClass === 'FOREX' ? 4 : 2 })}
              </span>
              <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                {isPos ? '+' : ''}{q.change24h}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView(user ? 'trading' : 'landing')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">{settings.platform_name || 'ApexTrader'}</span>
                <span className="text-[9px] uppercase font-black tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">{settings.platform_tagline || 'Institutional Platform'}</span>
            </div>
          </button>

          {/* Desktop Nav switcher */}
          {user && (
            <nav className="hidden md:flex items-center ml-6 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveView('trading')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'trading'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                Terminale
              </button>

              <button
                onClick={() => setActiveView('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'orders'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ordini
              </button>

              <button
                onClick={() => setActiveView('transactions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'transactions'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Transazioni
              </button>

              <button
                onClick={() => setActiveView('academy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'academy'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>⚡ Academy</span>
              </button>

              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeView.startsWith('admin')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  CRM Admin
                </button>
              )}
            </nav>
          )}

          {/* Logged Out Academy Link */}
          {!user && (
            <nav className="hidden md:flex items-center ml-4">
              <button
                onClick={() => setActiveView('academy')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeView === 'academy'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                    : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Quant Academy (A-Z)</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Section: Saldo & Profilo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Mobile Quick CRM Trigger Button (Visible on phones/tablets for Admin) */}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`md:hidden px-3 py-1.5 rounded-xl font-bold font-mono text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeView.startsWith('admin')
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>CRM</span>
                </button>
              )}

              {/* Account Number Badge (Desktop) */}
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-400 shadow-sm">
                <span className="text-slate-500 text-[10px] uppercase">Conto:</span>
                <strong className="text-cyan-400 font-bold">{user.accountNumber || 'APX-DEMO'}</strong>
              </span>

              {/* Mobile Compact Saldo (Always Visible) */}
              {portfolio && (
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl font-mono text-xs shadow-sm">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase leading-none">Capitale</span>
                    <span className="font-bold text-cyan-400 text-xs sm:text-sm leading-tight block">
                      ${portfolio.freeBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Esci"
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/60 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
              >
                Accedi
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
              >
                Registrati
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
