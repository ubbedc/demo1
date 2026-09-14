import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, UserPlus, DollarSign, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

interface AdminCreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({ onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Trader123!');
  const [initialBalance, setInitialBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Inserisci nome e indirizzo email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createUserByAdmin({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password || 'Trader123!',
        initialBalance: parseFloat(initialBalance) || 0,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione del cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registra Nuovo Cliente Demo</h2>
              <span className="text-[11px] text-slate-400">Creazione immediata anagrafica e portafoglio</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="m-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Nome e Cognome / Ragione Sociale</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="es. Mario Rossi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Indirizzo Email Ufficiale</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@dominio.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Password Iniziale</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Trader123!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Saldo Demo Iniziale ($)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="any"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-500">
            💡 <strong className="text-slate-400">Modello Conto Gestito:</strong> Il cliente potrà accedere come spettatore in tempo reale. Potrai accreditare o modificare i fondi in qualsiasi momento dalla console.
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Creazione in corso...' : 'Crea Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
