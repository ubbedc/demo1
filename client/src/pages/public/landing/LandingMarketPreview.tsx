import React from 'react';
import { useMarket } from '../../../context/MarketContext';
import { InteractiveChart } from '../../../components/common/InteractiveChart';
import { Activity, Sparkles } from 'lucide-react';

export const LandingMarketPreview: React.FC = () => {
  const { quotes, selectedQuote, selectedSymbol, setSelectedSymbol } = useMarket();

  return (
    <section id="market-preview-section" className="space-y-4 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Monitoraggio Mercati Istituzionali
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Grafico interattivo TradingView con candele giapponesi e streaming di liquidità multi-mercato
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Feed Multi-Asset Attivo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Interactive Chart (2 Columns) */}
        <div className="lg:col-span-2">
          <InteractiveChart quote={selectedQuote} />
        </div>

        {/* Quick Asset Palette (1 Column) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-black font-mono text-slate-300 uppercase tracking-wider block mb-3 flex items-center justify-between">
              <span>Asset Quotati in Tempo Reale</span>
              <span className="text-[10px] text-cyan-400 font-bold">1-CLICK SWITCH</span>
            </span>

            <div className="space-y-2 font-mono text-xs max-h-[380px] overflow-y-auto pr-1">
              {quotes.map((q) => {
                const isSelected = q.symbol === selectedSymbol;
                const isPos = q.change24h >= 0;
                const isForex = q.assetClass === 'FOREX';

                return (
                  <button
                    key={q.symbol}
                    type="button"
                    onClick={() => setSelectedSymbol(q.symbol)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-sm'
                        : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                          {q.symbol}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-bold uppercase">
                          {q.assetClass}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{q.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs block text-white">
                        ${q.last.toLocaleString(undefined, { minimumFractionDigits: isForex ? 4 : 2 })}
                      </span>
                      <span className={`text-[10px] font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}{q.change24h}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
            <span className="text-cyan-300 font-bold flex items-center gap-1 text-[10px]">
              <Sparkles className="w-3.5 h-3.5" />
              Interazione & Sincronizzazione
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Seleziona qualsiasi asset per sincronizzare all'istante il grafico TradingView centrale e l'order book.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
