import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { MarketQuote } from '../types';
import { api } from '../services/api';

interface MarketContextType {
  quotes: MarketQuote[];
  selectedSymbol: string;
  selectedQuote: MarketQuote | null;
  setSelectedSymbol: (symbol: string) => void;
  priceDirections: Record<string, 'up' | 'down' | 'neutral'>;
  isLoading: boolean;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const BINANCE_PAIR_MAP: Record<string, string> = {
  BTCUSDT: 'BTC/USD',
  ETHUSDT: 'ETH/USD',
  SOLUSDT: 'SOL/USD',
};

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USD');
  const [priceDirections, setPriceDirections] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Load & Background Polling for all quotes (Forex, Stocks, Crypto baseline)
    const fetchQuotes = async () => {
      try {
        const data = await api.getMarketQuotes();
        if (!isMounted) return;

        setQuotes((currentQuotes) => {
          if (currentQuotes.length === 0) return data;
          // Merge keeping any higher-frequency live tick
          return data.map((newItem) => {
            const existing = currentQuotes.find((c) => c.symbol === newItem.symbol);
            if (existing && (newItem.symbol.includes('BTC') || newItem.symbol.includes('ETH') || newItem.symbol.includes('SOL'))) {
              return { ...newItem, last: existing.last, ask: existing.ask, bid: existing.bid };
            }
            return newItem;
          });
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch market quotes:', err);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 2500);

    // 2. Real-Time Binance Multi-Stream WebSocket for Instant Live Crypto Ticks
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker');

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const tick = JSON.parse(event.data);
          const rawSymbol = tick.s; // e.g. BTCUSDT
          const localSymbol = BINANCE_PAIR_MAP[rawSymbol];

          if (localSymbol && tick.c) {
            const livePrice = parseFloat(tick.c);
            const high24h = parseFloat(tick.h) || livePrice;
            const low24h = parseFloat(tick.l) || livePrice;
            const change24h = parseFloat(tick.P) || 0;
            const volume24h = parseFloat(tick.v) || 0;

            const prev = prevPricesRef.current[localSymbol];
            const direction = prev !== undefined ? (livePrice > prev ? 'up' : livePrice < prev ? 'down' : 'neutral') : 'neutral';
            prevPricesRef.current[localSymbol] = livePrice;

            setPriceDirections((prevDirs) => ({
              ...prevDirs,
              [localSymbol]: direction,
            }));

            setQuotes((prevQuotes) =>
              prevQuotes.map((q) =>
                q.symbol === localSymbol
                  ? {
                      ...q,
                      last: livePrice,
                      bid: Number((livePrice * 0.9999).toFixed(2)),
                      ask: Number((livePrice * 1.0001).toFixed(2)),
                      high24h,
                      low24h,
                      change24h: Number(change24h.toFixed(2)),
                      volume24h: Math.round(volume24h),
                    }
                  : q
              )
            );
          }
        } catch (e) {
          console.error('Error processing Binance ticker WS:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('Binance Ticker WS error:', err);
      };
    } catch (err) {
      console.warn('Could not connect to Binance Ticker WS:', err);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (ws) {
        ws.onmessage = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, []);

  const selectedQuote = quotes.find((q) => q.symbol === selectedSymbol) || (quotes.length > 0 ? quotes[0] : null);

  return (
    <MarketContext.Provider
      value={{
        quotes,
        selectedSymbol,
        selectedQuote,
        setSelectedSymbol,
        priceDirections,
        isLoading,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider');
  return context;
};
