import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Transaction } from '../../types';
import { ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Registro Transazioni (Ledger)</h2>
          <p className="text-xs text-slate-400 font-mono">Movimenti contabili, accrediti demo, addebiti ordini e chiusure</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          Aggiorna
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs">Caricamento transazioni...</div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-mono text-xs">Nessuna transazione registrata.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5">Data / Ora</th>
                <th className="py-2.5">Tipologia</th>
                <th className="py-2.5">Descrizione</th>
                <th className="py-2.5 text-right">Importo Movimentato</th>
                <th className="py-2.5 text-right">Saldo Risultante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => {
                const isPositive = tx.amount >= 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-400">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-200">{tx.description}</td>
                    <td className={`py-3 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right font-semibold text-white">
                      ${tx.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
