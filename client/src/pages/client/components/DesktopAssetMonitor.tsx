import React, { useState } from 'react';
import { MarketQuote } from '../../../types';
import { formatPrice, formatPercent } from '../../../utils/formatters';
import { Search, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface DesktopAssetMonitorProps {
  quotes: MarketQuote[];
  selectedSymbol: string;
  priceDirections: Record<string, 'up' | 'down' | 'neutral'>;
  onSelectSymbol: (symbol: string) => void;
}

export const DesktopAssetMonitor: React.FC<DesktopAssetMonitorProps> = ({
  quotes,
  selectedSymbol,
  priceDirections,
  onSelectSymbol,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'ALL' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'INDEX' | 'STOCK'>('ALL');

  const filtered = quotes.filter((q) => {
    const matchesSearch =
      q.symbol.toLowerCase().includes(search.toLowerCase()) ||
      q.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || q.assetClass === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col h-full space-y-3 font-mono text-xs shadow-xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cerca asset, oro, indici..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
        />
      </div>

      {/* Asset Category Filter Chips */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px]">
        {(['ALL', 'CRYPTO', 'FOREX', 'COMMODITY', 'INDEX', 'STOCK'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              category === cat
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'COMMODITY' ? 'COMM' : cat}
          </button>
        ))}
      </div>

      {/* Asset Quotes List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[460px]">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-500">Nessun asset trovato.</div>
        ) : (
          filtered.map((q) => {
            const isSelected = q.symbol === selectedSymbol;
            const isPos = q.change24h >= 0;
            const flash = priceDirections[q.symbol];

            return (
              <button
                key={q.symbol}
                type="button"
                onClick={() => onSelectSymbol(q.symbol)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800/90 text-slate-300'
                } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-black text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                      {q.symbol}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                      {q.assetClass}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{q.name}</span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-xs block text-white">
                    {formatPrice(q.last, q.assetClass)}
                  </span>
                  <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {formatPercent(q.change24h)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
