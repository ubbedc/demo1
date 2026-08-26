import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Shield, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'autenticazione.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-sheet-up sm:animate-in sm:fade-in sm:zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Mobile iOS Sheet Drag Indicator */}
        <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-slate-950">
          <div className="w-10 h-1 rounded-full bg-slate-700/80"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">
              ▲
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {mode === 'login' ? 'Accesso Terminale Istituzionale' : 'Attivazione Nuovo Conto'}
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">PROTOCOLLO CRITTOGRAFATO SSL</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Credentials Box */}
        <div className="bg-slate-950/80 p-3.5 border-b border-slate-800 text-xs font-mono">
          <span className="text-slate-400 block mb-2 font-bold text-[11px]">⚡ Accesso Rapido Demo di Test:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('trader@apextrader.demo', 'Trader123!')}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-left transition-all cursor-pointer"
            >
              <span className="text-cyan-400 font-bold block text-[11px]">Trader Demo (Pre-finanziato)</span>
              <span className="text-slate-500 text-[10px] block">trader@apextrader.demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@apextrader.demo', 'Admin123!')}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-left transition-all cursor-pointer"
            >
              <span className="text-amber-400 font-bold block text-[11px]">Admin CRM</span>
              <span className="text-slate-500 text-[10px] block">admin@apextrader.demo</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-md font-bold transition-all cursor-pointer ${
                mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-md font-bold transition-all cursor-pointer ${
                mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrati
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-slate-400 block mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Indirizzo Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-wider mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Elaborazione in corso...' : mode === 'login' ? 'Accedi al Terminale' : 'Attiva Conto Istituzionale'}
          </button>
        </form>
      </div>
    </div>
  );
};
