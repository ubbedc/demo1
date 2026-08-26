import React, { useRef, useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Flame } from 'lucide-react';

export const MarketTickerCarousel: React.FC = () => {
  const { quotes, selectedSymbol, setSelectedSymbol, priceDirections } = useMarket();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll loop when not hovered
  useEffect(() => {
    if (isPaused || !scrollContainerRef.current) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        // If reached end, smoothly loop back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (quotes.length === 0) return null;

  return (
    <div 
      className="relative bg-slate-950/80 border border-slate-800/90 rounded-2xl p-2.5 backdrop-blur-md shadow-lg overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Navigation Arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer backdrop-blur-sm"
        aria-label="Scorri a sinistra"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer backdrop-blur-sm"
        aria-label="Scorri a destra"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Live Badge Indicator */}
      <div className="flex items-center gap-2 mb-1.5 px-1.5 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 font-bold text-cyan-400">
          <Flame className="w-3.5 h-3.5 text-cyan-400" />
          TICKER LIVE WALL STREET
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Streaming Real-Time
        </span>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <span className="text-slate-500 hidden sm:inline">Clicca su un asset per aprire il grafico</span>
      </div>

      {/* Smooth Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {quotes.map((q) => {
          const isSelected = q.symbol === selectedSymbol;
          const isPos = q.change24h >= 0;
          const flash = priceDirections[q.symbol];
          const isForex = q.assetClass === 'FOREX';

          return (
            <button
              key={q.symbol}
              type="button"
              onClick={() => setSelectedSymbol(q.symbol)}
              className={`shrink-0 flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all font-mono text-xs cursor-pointer select-none border ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800/90 text-slate-300 hover:border-slate-700'
              } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
            >
              {/* Asset Name & Class Badge */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`font-black text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {q.symbol}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800/80 text-slate-400 font-bold uppercase">
                    {q.assetClass}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block truncate max-w-[85px]">{q.name}</span>
              </div>

              {/* Price & Change */}
              <div className="text-right pl-2 border-l border-slate-800/80">
                <span className="font-extrabold text-xs block text-white">
                  ${q.last.toLocaleString(undefined, { minimumFractionDigits: isForex ? 4 : 2 })}
                </span>
                <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {isPos ? '+' : ''}{q.change24h}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
