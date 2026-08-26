import React, { useState } from 'react';
import { Position, Order, Transaction } from '../../../types';
import { formatCurrency, formatPrice, formatDateTime } from '../../../utils/formatters';
import { Activity, Clock, Receipt, FileText, Download, ShieldCheck } from 'lucide-react';

interface DesktopBottomTabsProps {
  positions: Position[];
  orders: Order[];
  transactions: Transaction[];
  onOpenStatement: () => void;
  onDirectDownloadPDF: () => void;
}

export const DesktopBottomTabs: React.FC<DesktopBottomTabsProps> = ({
  positions,
  orders,
  transactions,
  onOpenStatement,
  onDirectDownloadPDF,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'transactions'>('positions');

  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4 font-mono text-xs shadow-xl">
      {/* Header & Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Posizioni Aperte ({positions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Storico Ordini ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Estratto Conto Ledger ({transactions.length})
          </button>
        </div>

        {/* Statement Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDirectDownloadPDF}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Scarica PDF (.pdf)
          </button>

          <button
            type="button"
            onClick={onOpenStatement}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Anteprima Report
          </button>
        </div>
      </div>

      {/* Tab 1: Positions */}
      {activeTab === 'positions' && (
        <div className="overflow-x-auto">
          {positions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Nessuna posizione aperta al momento. Le operazioni eseguite dal gestore CRM appariranno qui in tempo reale.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Lato</th>
                  <th className="py-2.5 px-3">Quantità</th>
                  <th className="py-2.5 px-3">Prezzo Entrata</th>
                  <th className="py-2.5 px-3">Prezzo Live</th>
                  <th className="py-2.5 px-3 text-right">P/L ($)</th>
                  <th className="py-2.5 px-3 text-right">Stato</th>
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
                      <td className="py-2.5 px-3 text-right font-black">
                        <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isProfit ? '+' : ''}{formatCurrency(p.unrealizedPnL)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                          GESTITO DA CRM
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto max-h-64">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Nessun ordine registrato.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Lato</th>
                  <th className="py-2.5 px-3">Quantità</th>
                  <th className="py-2.5 px-3">Prezzo Eseguito</th>
                  <th className="py-2.5 px-3 text-right">Controvalore</th>
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
                    <td className="py-2 px-3 text-right font-bold text-cyan-300">{formatCurrency(o.notional_value)}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <div className="overflow-x-auto max-h-64">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">Nessun movimento contabile registrato.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
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
          )}
        </div>
      )}
    </div>
  );
};
