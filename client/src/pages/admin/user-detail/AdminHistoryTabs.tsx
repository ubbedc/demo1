import React, { useState } from 'react';
import { api } from '../../../services/api';
import { Position, Order, Transaction } from '../../../types';
import { formatCurrency, formatPrice, formatDateTime } from '../../../utils/formatters';
import { Activity, History, Receipt, XCircle, Edit3, Calendar, Check, X } from 'lucide-react';

interface AdminHistoryTabsProps {
  userId: string;
  positions: Position[];
  orders: Order[];
  transactions: Transaction[];
  onRefresh: () => void;
}

function parseDateForInput(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  try {
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
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
  
  // Date Editing State
  const [editingDate, setEditingDate] = useState<{
    type: 'order' | 'transaction';
    id: string;
    date: string;
  } | null>(null);
  const [savingDate, setSavingDate] = useState(false);

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

  const handleSaveDate = async () => {
    if (!editingDate || !editingDate.date) return;
    setSavingDate(true);
    try {
      const normalized = editingDate.date.includes('T') ? editingDate.date : editingDate.date.replace(' ', 'T');
      const d = new Date(normalized);
      const formattedDate = isNaN(d.getTime())
        ? new Date().toISOString().replace('T', ' ').substring(0, 19)
        : d.toISOString().replace('T', ' ').substring(0, 19);

      if (editingDate.type === 'order') {
        await api.updateOrderDate(editingDate.id, formattedDate);
      } else {
        await api.updateTransactionDate(editingDate.id, formattedDate);
      }
      alert('Data aggiornata con successo!');
      setEditingDate(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Errore durante l\'aggiornamento della data.');
    } finally {
      setSavingDate(false);
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
                    <th className="py-2.5 px-3">Data / Modifica</th>
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
                      <td className="py-2 px-3 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{formatDateTime(o.created_at)}</span>
                          <button
                            type="button"
                            title="Modifica Data Esecuzione Ordine"
                            onClick={() => setEditingDate({
                              type: 'order',
                              id: o.id,
                              date: parseDateForInput(o.created_at)
                            })}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
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
                    <th className="py-2.5 px-3">Data / Modifica</th>
                    <th className="py-2.5 px-3">Causale</th>
                    <th className="py-2.5 px-3">Descrizione</th>
                    <th className="py-2.5 px-3 text-right">Importo ($)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Risultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{formatDateTime(t.created_at)}</span>
                          <button
                            type="button"
                            title="Modifica Data Transazione Ledger"
                            onClick={() => setEditingDate({
                              type: 'transaction',
                              id: t.id,
                              date: parseDateForInput(t.created_at)
                            })}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
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

      {/* Date Edit Modal Dialog */}
      {editingDate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 font-mono animate-sheet-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Modifica Data {editingDate.type === 'order' ? 'Ordine Eseguito' : 'Transazione Ledger'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDate(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 block font-bold">Nuova Data e Ora:</label>
              <input
                type="datetime-local"
                value={editingDate.date}
                onChange={(e) => setEditingDate({ ...editingDate, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <span className="text-[11px] text-slate-400 block pt-1">
                ℹ️ Il timestamp verrà registrato nel database e apparirà nell'estratto conto PDF.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingDate(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all cursor-pointer text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSaveDate}
                disabled={savingDate}
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  fontWeight: 900,
                  boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.45)',
                }}
                className="px-6 py-2.5 hover:brightness-110 active:scale-95 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-black stroke-[3]" />
                {savingDate ? 'Salvataggio in corso...' : 'Salva Nuova Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
