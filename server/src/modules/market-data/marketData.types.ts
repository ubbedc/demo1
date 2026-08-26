export interface MarketQuote {
  symbol: string;
  name: string;
  assetClass: 'CRYPTO' | 'FOREX' | 'STOCK' | 'COMMODITY' | 'INDEX';
  bid: number;
  ask: number;
  last: number;
  high24h: number;
  low24h: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
  history: { time: number; price: number }[];
}

export interface IMarketDataProvider {
  getQuote(symbol: string): MarketQuote | null;
  getAllQuotes(): MarketQuote[];
  startTickLoop(intervalMs?: number): void;
  stopTickLoop(): void;
}
