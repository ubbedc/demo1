import React, { useState } from 'react';
import { api } from '../../../services/api';
import { DollarSign, ShieldAlert } from 'lucide-react';

interface AdminFundsDeskProps {
  userId: string;
  userStatus: 'ACTIVE' | 'SUSPENDED';
  onSuccess: () => void;
}

export const AdminFundsDesk: React.FC<AdminFundsDeskProps> = ({ userId, userStatus, onSuccess }) => {
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [fundReason, setFundReason] = useState('');
  const [fundSubmitting, setFundSubmitting] = useState(false);

  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const handleAdjustFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) return;

    setFundSubmitting(true);
    try {
      await api.adjustUserFunds(userId, {
        amount: amt,
        type: fundType,
        reason: fundReason || (fundType === 'ADD' ? 'Allocazione Capitale Gestito' : 'Storno Capitale'),
      });
      alert(`Fondi demo ${fundType === 'ADD' ? 'accreditati' : 'stornati'} con successo!`);
      setFundAmount('');
      setFundReason('');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Errore durante la modifica dei fondi.');
    } finally {
      setFundSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = userStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Sei sicuro di voler impostare lo stato dell'utente su ${newStatus}?`)) return;

    setStatusSubmitting(true);
    try {
      await api.setUserStatus(userId, {
        status: newStatus,
        reason: `Aggiornamento manuale stato a ${newStatus} da CRM`,
      });
      alert(`Stato utente aggiornato a ${newStatus}!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Errore durante il cambio stato.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
      {/* 1. Adjust Demo Funds */}
      <form onSubmit={handleAdjustFunds} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Iniezione / Storno Fondi Demo
          </span>
          <span className="text-[10px] text-amber-400 font-bold">PRODUCE AUDIT</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFundType('ADD')}
            className={`py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              fundType === 'ADD' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
            }`}
          >
            + Accredita Fondi
          </button>
          <button
            type="button"
            onClick={() => setFundType('REMOVE')}
            className={`py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              fundType === 'REMOVE' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'
            }`}
          >
            - Storna Fondi
          </button>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Importo ($ USD)</label>
          <input
            type="number"
            step="any"
            required
            placeholder="es. 10000"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Causale Operativa</label>
          <input
            type="text"
            placeholder="es. Assegnazione capitale trader..."
            value={fundReason}
            onChange={(e) => setFundReason(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={fundSubmitting}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {fundSubmitting ? 'Registrazione...' : `Conferma ${fundType === 'ADD' ? 'Accredito' : 'Storno'}`}
        </button>
      </form>

      {/* 2. User Status Moderation */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Controllo & Moderazione Utente
            </span>
          </div>

          <div className="space-y-2 pt-2 text-slate-400">
            <p className="text-[11px]">
              Stato attuale account: <strong className={userStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}>{userStatus}</strong>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              La sospensione blocca istantaneamente l'accesso al terminale per l'utente, mantenendo intatte le posizioni e lo storico ledger.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={statusSubmitting}
          className={`w-full py-2 font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
            userStatus === 'ACTIVE'
              ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {statusSubmitting ? 'Aggiornamento...' : userStatus === 'ACTIVE' ? 'Sospendi Accesso Utente' : 'Riattiva Account Utente'}
        </button>
      </div>
    </div>
  );
};
