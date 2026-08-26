import React, { useState } from 'react';
import { api } from '../../../services/api';
import { Position, Order, Transaction } from '../../../types';
import { formatCurrency, formatPrice, formatDateTime } from '../../../utils/formatters';
import { Activity, History, Receipt, XCircle } from 'lucide-react';

interface AdminHistoryTabsProps {
  userId: string;
  positions: Position[];
  orders: Order[];
  transactions: Transaction[];
  onRefresh: () => void;
}

export const AdminHistoryTabs: React.FC<AdminHistoryTabsProps> = ({
  userId,
  positions,
  orders,
  transactions,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'transactions'>('positions');
  const [closingId, setClosingId] = useState<string | null>(null);

  const handleClosePosition = async (positionId: string) => {
    if (!confirm('Sei sicuro di voler liquidare a mercato questa posizione per conto del cliente?')) return;

    setClosingId(positionId);
    try {
      await api.closePositionForUser(userId, positionId);
      alert('Posizione chiusa e liquidata sul conto del cliente!');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Errore durante la chiusura.');
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('positions')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'positions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Posizioni Aperte ({positions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Ordini Eseguiti ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'transactions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Estratto Conto Ledger ({transactions.length})
        </button>
      </div>

      {/* 1. Open Positions Tab */}
      {activeTab === 'positions' && (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          {positions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Nessuna posizione aperta al momento per questo utente.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Lato</th>
                    <th className="py-2.5 px-3">Quantità</th>
                    <th className="py-2.5 px-3">Prezzo Entrata</th>
                    <th className="py-2.5 px-3">Prezzo Live</th>
                    <th className="py-2.5 px-3">P/L ($)</th>
                    <th className="py-2.5 px-3 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {positions.map((p) => {
                    const isLong = p.side === 'LONG';
                    const isProfit = (p.unrealizedPnL || 0) >= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-white">{p.assetSymbol}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                            isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {p.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">{p.quantity}</td>
                        <td className="py-2.5 px-3">{formatPrice(p.averageEntryPrice)}</td>
                        <td className="py-2.5 px-3 font-bold text-cyan-300">{formatPrice(p.currentPrice)}</td>
                        <td className="py-2.5 px-3 font-black">
                          <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {isProfit ? '+' : ''}{formatCurrency(p.unrealizedPnL)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleClosePosition(p.id)}
                            disabled={closingId === p.id}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            {closingId === p.id ? 'Chiusura...' : 'Chiudi a Mercato'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Executed Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Nessun ordine registrato.</div>
          ) : (
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Lato</th>
                    <th className="py-2.5 px-3">Quantità</th>
                    <th className="py-2.5 px-3">Prezzo Eseguito</th>
                    <th className="py-2.5 px-3">Controvalore</th>
                    <th className="py-2.5 px-3 text-right">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400">{formatDateTime(o.created_at)}</td>
                      <td className="py-2 px-3 font-bold text-white">{o.asset_symbol}</td>
                      <td className="py-2 px-3 font-bold">
                        <span className={o.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{o.side}</span>
                      </td>
                      <td className="py-2 px-3">{o.quantity}</td>
                      <td className="py-2 px-3">{formatPrice(o.executed_price)}</td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">{formatCurrency(o.notional_value)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Ledger Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden shadow-md">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Nessuna transazione contabile registrata.</div>
          ) : (
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Causale</th>
                    <th className="py-2.5 px-3">Descrizione</th>
                    <th className="py-2.5 px-3 text-right">Importo ($)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Risultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400">{formatDateTime(t.created_at)}</td>
                      <td className="py-2 px-3 font-bold text-white">{t.type}</td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-xs">{t.description}</td>
                      <td className={`py-2 px-3 text-right font-bold ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.amount >= 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {formatCurrency(t.balance_after)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
