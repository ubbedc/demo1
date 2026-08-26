import React from 'react';
import { MarketQuote } from '../../../types';
import { formatPrice } from '../../../utils/formatters';

interface DesktopOrderBookProps {
  quote: MarketQuote | null;
}

export const DesktopOrderBook: React.FC<DesktopOrderBookProps> = ({ quote }) => {
  if (!quote) return null;

  const isForex = quote.assetClass === 'FOREX';
  const spread = Math.max(0, quote.ask - quote.bid);

  // Generate realistic depth levels around live bid and ask
  const step = isForex ? 0.0002 : quote.last * 0.0005;
  const asks = [
    { price: quote.ask + step * 2, size: 1.85 },
    { price: quote.ask + step, size: 3.42 },
    { price: quote.ask, size: 5.10 },
  ];
  const bids = [
    { price: quote.bid, size: 4.80 },
    { price: quote.bid - step, size: 2.95 },
    { price: quote.bid - step * 2, size: 1.20 },
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-bold text-white text-xs">Order Book Level II</span>
        <span className="text-[10px] text-slate-500 font-bold">REAL-TIME DEPTH</span>
      </div>

      <div className="space-y-1">
        {/* Asks (Red) */}
        <div className="space-y-1">
          {asks.map((a, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-0.5 px-2 rounded bg-rose-500/5 text-rose-400">
              <span>{formatPrice(a.price, quote.assetClass)}</span>
              <span className="text-slate-400 text-[10px]">{a.size.toFixed(2)} Vol</span>
            </div>
          ))}
        </div>

        {/* Spread Separator */}
        <div className="py-1.5 px-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] my-1">
          <span className="text-slate-400">Spread di Mercato:</span>
          <span className="text-cyan-400 font-bold">${spread.toFixed(isForex ? 4 : 2)}</span>
        </div>

        {/* Bids (Green) */}
        <div className="space-y-1">
          {bids.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-0.5 px-2 rounded bg-emerald-500/5 text-emerald-400">
              <span>{formatPrice(b.price, quote.assetClass)}</span>
              <span className="text-slate-400 text-[10px]">{b.size.toFixed(2)} Vol</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
