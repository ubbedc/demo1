import { IMarketDataProvider, MarketQuote } from './marketData.types';
import db from '../../core/database/db';

export class SimulatedMarketService implements IMarketDataProvider {
  private quotes: Map<string, MarketQuote> = new Map();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeQuotes();
  }

  private initializeQuotes() {
    const assets = db.prepare('SELECT * FROM assets WHERE is_active = 1').all() as any[];

    const now = Date.now();
    for (const a of assets) {
      const base = a.base_price;
      const spreadPct = a.asset_class === 'FOREX' ? 0.00015 : a.asset_class === 'CRYPTO' ? 0.0006 : 0.0003;
      const spread = base * spreadPct;

      // Generate 50 points of realistic historical data points for initial chart rendering
      const history: { time: number; price: number }[] = [];
      let currentP = base * 0.98;
      for (let i = 50; i >= 0; i--) {
        const delta = (Math.random() - 0.49) * (base * 0.004);
        currentP = Math.max(base * 0.5, currentP + delta);
        history.push({
          time: now - i * 5000,
          price: Number(currentP.toFixed(a.asset_class === 'FOREX' ? 4 : 2)),
        });
      }

      this.quotes.set(a.symbol, {
        symbol: a.symbol,
        name: a.name,
        assetClass: a.asset_class,
        last: base,
        bid: Number((base - spread / 2).toFixed(a.asset_class === 'FOREX' ? 4 : 2)),
        ask: Number((base + spread / 2).toFixed(a.asset_class === 'FOREX' ? 4 : 2)),
        high24h: Number((base * 1.035).toFixed(a.asset_class === 'FOREX' ? 4 : 2)),
        low24h: Number((base * 0.965).toFixed(a.asset_class === 'FOREX' ? 4 : 2)),
        change24h: Number(((Math.random() * 4) - 1.5).toFixed(2)),
        volume24h: Math.floor(100000 + Math.random() * 5000000),
        timestamp: now,
        history,
      });
    }
  }

  public getQuote(symbol: string): MarketQuote | null {
    return this.quotes.get(symbol) || null;
  }

  public getAllQuotes(): MarketQuote[] {
    return Array.from(this.quotes.values());
  }

  public startTickLoop(intervalMs = 1500): void {
    if (this.timer) return;

    // Periodic Live Sync with Binance for Crypto Assets
    const syncBinancePrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]');
        if (res.ok) {
          const prices: { symbol: string; price: string }[] = await res.json();
          for (const item of prices) {
            let localSym = '';
            if (item.symbol === 'BTCUSDT') localSym = 'BTC/USD';
            if (item.symbol === 'ETHUSDT') localSym = 'ETH/USD';
            if (item.symbol === 'SOLUSDT') localSym = 'SOL/USD';

            const quote = this.quotes.get(localSym);
            if (quote) {
              const liveP = parseFloat(item.price);
              const spread = liveP * 0.0006;
              quote.last = liveP;
              quote.bid = Number((liveP - spread / 2).toFixed(2));
              quote.ask = Number((liveP + spread / 2).toFixed(2));
              quote.timestamp = Date.now();
            }
          }
        }
      } catch (_) {}
    };

    syncBinancePrices();
    const binanceInterval = setInterval(syncBinancePrices, 4000);

    this.timer = setInterval(() => {
      const now = Date.now();
      for (const [symbol, q] of this.quotes.entries()) {
        // Random walk percentage fluctuation (-0.25% to +0.25%)
        const volatility = q.assetClass === 'CRYPTO' ? 0.0025 : q.assetClass === 'FOREX' ? 0.0003 : 0.001;
        const deltaPct = (Math.random() - 0.495) * volatility;
        const newPriceRaw = q.last * (1 + deltaPct);
        const decimals = q.assetClass === 'FOREX' ? 4 : 2;
        const newPrice = Number(newPriceRaw.toFixed(decimals));

        const spreadPct = q.assetClass === 'FOREX' ? 0.00015 : 0.0006;
        const spread = newPrice * spreadPct;

        // If not synced by Binance, update simulated tick
        if (!symbol.includes('BTC') && !symbol.includes('ETH') && !symbol.includes('SOL')) {
          q.last = newPrice;
          q.bid = Number((newPrice - spread / 2).toFixed(decimals));
          q.ask = Number((newPrice + spread / 2).toFixed(decimals));
        }

        q.high24h = Math.max(q.high24h, q.last);
        q.low24h = Math.min(q.low24h, q.last);
        q.timestamp = now;

        // Keep last 100 history points
        q.history.push({ time: now, price: q.last });
        if (q.history.length > 100) {
          q.history.shift();
        }
      }
    }, intervalMs);
  }

  public stopTickLoop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const marketService = new SimulatedMarketService();
