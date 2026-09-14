export interface CandleBar {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d';

const SYMBOL_MAPPING: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
};

export class RealTimeMarketService {
  private ws: WebSocket | null = null;
  private currentSymbol = '';
  private currentTimeframe: Timeframe = '1m';
  private onTickCallback: ((bar: CandleBar, isNew: boolean) => void) | null = null;

  public async fetchHistoricalCandles(symbol: string, timeframe: Timeframe, limit = 120): Promise<CandleBar[]> {
    const binanceSymbol = SYMBOL_MAPPING[symbol];

    if (binanceSymbol) {
      try {
        const binanceInterval = timeframe === '1d' ? '1d' : timeframe;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const raw = await res.json();
          const parsed: CandleBar[] = raw.map((k: any[]) => ({
            time: Math.floor(k[0] / 1000), // Open time in seconds
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
          }));

          // Strict ascending sort & deduplication for TradingView Lightweight Charts
          parsed.sort((a, b) => a.time - b.time);
          const uniqueBars = parsed.filter((b, idx, arr) => idx === 0 || b.time > arr[idx - 1].time);
          if (uniqueBars.length > 0) {
            return uniqueBars;
          }
        }
      } catch (err) {
        console.warn('Binance REST fetch fallback to synthetic:', err);
      }
    }

    // Fallback Realistic Synthetic History Generator (for Forex/Stocks or offline/rate-limited)
    return this.generateSyntheticCandles(symbol, timeframe, limit);
  }

  public subscribeRealTime(
    symbol: string,
    timeframe: Timeframe,
    onTick: (bar: CandleBar, isNew: boolean) => void
  ) {
    this.unsubscribe();
    this.currentSymbol = symbol;
    this.currentTimeframe = timeframe;
    this.onTickCallback = onTick;

    const binanceSymbol = SYMBOL_MAPPING[symbol];

    if (binanceSymbol) {
      const streamName = `${binanceSymbol.toLowerCase()}@kline_${timeframe}`;
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.e === 'kline' && data.k) {
              const k = data.k;
              const bar: CandleBar = {
                time: Math.floor(k.t / 1000),
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v),
              };
              const isClosed = k.x; // true if the candle has closed
              if (this.onTickCallback) {
                this.onTickCallback(bar, isClosed);
              }
            }
          } catch (e) {
            console.error('Error parsing WS tick:', e);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('Binance WebSocket connection error:', err);
        };
      } catch (err) {
        console.warn('Could not initialize WebSocket:', err);
      }
    }
  }

  public unsubscribe() {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    this.onTickCallback = null;
  }

  private generateSyntheticCandles(symbol: string, timeframe: Timeframe, count: number): CandleBar[] {
    const bars: CandleBar[] = [];
    const stepSeconds = this.getTimeframeSeconds(timeframe);
    const now = Math.floor(Date.now() / 1000);

    let basePrice = 1.085;
    if (symbol.includes('BTC')) basePrice = 64500.0;
    if (symbol.includes('ETH')) basePrice = 2480.0;
    if (symbol.includes('SOL')) basePrice = 98.5;
    if (symbol.includes('AAPL')) basePrice = 228.5;
    if (symbol.includes('NVDA')) basePrice = 129.8;
    if (symbol.includes('GBP')) basePrice = 1.295;
    if (symbol.includes('XAU')) basePrice = 2650.0;
    if (symbol.includes('XAG')) basePrice = 31.8;
    if (symbol.includes('WTI')) basePrice = 74.5;
    if (symbol.includes('NDX')) basePrice = 19850.0;
    if (symbol.includes('SPX')) basePrice = 5780.0;

    let current = basePrice;

    const isForex = symbol === 'EUR/USD' || symbol === 'GBP/USD';
    const decimals = isForex ? 4 : 2;

    for (let i = count; i >= 0; i--) {
      const time = now - i * stepSeconds;
      const volatility = current * 0.002;
      const delta = (Math.random() - 0.49) * volatility;
      const open = Number(current.toFixed(decimals));
      const close = Number((open + delta).toFixed(decimals));
      const rawHigh = Math.max(open, close) + Math.random() * volatility * 0.5;
      const rawLow = Math.max(0.0001, Math.min(open, close) - Math.random() * volatility * 0.5);
      const high = Math.max(open, close, Number(rawHigh.toFixed(decimals)));
      const low = Math.min(open, close, Number(rawLow.toFixed(decimals)));
      const volume = Math.floor(Math.random() * 5000) + 500;

      bars.push({ time, open, high, low, close, volume });
      current = close;
    }

    bars.sort((a, b) => a.time - b.time);
    return bars;
  }

  public getTimeframeSeconds(tf: Timeframe): number {
    switch (tf) {
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '1h': return 3600;
      case '1d': return 86400;
      default: return 60;
    }
  }
}

export const realTimeMarket = new RealTimeMarketService();
