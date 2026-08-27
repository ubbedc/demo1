import React, { useState } from 'react';
import { api } from '../../../services/api';
import { MarketQuote } from '../../../types';
import { formatPrice, formatCurrency } from '../../../utils/formatters';
import { LineChart, Sparkles, Calendar } from 'lucide-react';

interface AdminTradeDeskProps {
  userId: string;
  freeBalance: number;
  quotes: MarketQuote[];
  onSuccess: () => void;
}

export const AdminTradeDesk: React.FC<AdminTradeDeskProps> = ({
  userId,
  freeBalance,
  quotes,
  onSuccess,
}) => {
  const [symbol, setSymbol] = useState('BTC/USD');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('0.1');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentQuote = quotes.find((q) => q.symbol === symbol);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    setSubmitting(true);
    try {
      await api.executeOrderForUser(userId, {
        symbol,
        side,
        quantity: qty,
        takeProfitPrice: takeProfit ? parseFloat(takeProfit) : undefined,
        stopLossPrice: stopLoss ? parseFloat(stopLoss) : undefined,
        customExecutionDate: customDate ? new Date(customDate).toISOString().replace('T', ' ').substring(0, 19) : undefined,
      });
      alert(`Operazione ${side} ${qty} ${symbol} eseguita con successo per il cliente!`);
      setTakeProfit('');
      setStopLoss('');
      setCustomDate('');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Errore durante l\'esecuzione del trade per l\'utente.');
    } finally {
      setSubmitting(false);
    }
  };

  const notional = (parseFloat(quantity) || 0) * (currentQuote?.last || 0);

  return (
    <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
          <LineChart className="w-4 h-4 text-cyan-400" />
          Desk Operativo: Esegui Trade per il Cliente
        </span>
        <span className="text-[10px] text-cyan-400 font-bold">GESTIONE DIRETTA CRM</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
        {/* Asset Selection */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Asset da Scambiare</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold cursor-pointer focus:outline-none focus:border-cyan-500"
          >
            <optgroup label="Criptovalute (Crypto)">
              {quotes.filter((q) => q.assetClass === 'CRYPTO').map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} — {q.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Cambi Valutari (Forex)">
              {quotes.filter((q) => q.assetClass === 'FOREX').map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} — {q.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Materie Prime (Commodities)">
              {quotes.filter((q) => q.assetClass === 'COMMODITY').map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} — {q.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Indici di Borsa (Indices)">
              {quotes.filter((q) => q.assetClass === 'INDEX').map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} — {q.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Azioni (Stocks)">
              {quotes.filter((q) => q.assetClass === 'STOCK').map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} — {q.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Side */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Direzione Ordine</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                side === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                side === 'SELL' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Quantità ({symbol.split('/')[0]})</label>
          <input
            type="number"
            step="any"
            min="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* TP */}
        <div>
          <label className="text-[11px] text-emerald-400 block mb-1">Take Profit ($ TP)</label>
          <input
            type="number"
            step="any"
            placeholder="Opzionale"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full bg-slate-900 border border-emerald-500/30 rounded px-2.5 py-1.5 text-emerald-300 font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* SL */}
        <div>
          <label className="text-[11px] text-rose-400 block mb-1">Stop Loss ($ SL)</label>
          <input
            type="number"
            step="any"
            placeholder="Opzionale"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full bg-slate-900 border border-rose-500/30 rounded px-2.5 py-1.5 text-rose-300 font-bold placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Optional Custom Execution Date Row */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Data/Ora Esecuzione (Opzionale):
          </label>
          <input
            type="datetime-local"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
          />
          {customDate && (
            <button
              type="button"
              onClick={() => setCustomDate('')}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reimposta su Adesso
            </button>
          )}
        </div>
        {!customDate && (
          <span className="text-[10px] text-slate-500 font-mono">
            ⚡ Default: Timestamp in tempo reale (Adesso)
          </span>
        )}
      </div>

      {/* Footer Info & Submit */}
      <div className="pt-2 flex items-center justify-between text-xs">
        {currentQuote ? (
          <div className="text-[11px] text-slate-400 flex items-center gap-4">
            <span>Prezzo attuale: <strong className="text-white">{formatPrice(currentQuote.last, currentQuote.assetClass)}</strong></span>
            <span>Controvalore: <strong className="text-cyan-400">{formatCurrency(notional)}</strong></span>
          </div>
        ) : <div />}

        <button
          type="submit"
          disabled={submitting || (freeBalance === 0 && side === 'BUY')}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Esecuzione...' : `Esegui ${side} per Utente`}
        </button>
      </div>
    </form>
  );
};
