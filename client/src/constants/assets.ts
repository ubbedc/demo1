/**
 * Central Tradable Asset Registry
 * Adding an asset here configures its parameters across the platform.
 */

export interface AssetDefinition {
  symbol: string;
  name: string;
  assetClass: 'CRYPTO' | 'FOREX' | 'STOCK' | 'COMMODITY' | 'INDEX';
  binanceStream?: string;
  decimals: number;
  minOrderQty: number;
  defaultLot: number;
}

export const ASSET_REGISTRY: Record<string, AssetDefinition> = {
  // Crypto
  'BTC/USD': {
    symbol: 'BTC/USD',
    name: 'Bitcoin / USD',
    assetClass: 'CRYPTO',
    binanceStream: 'btcusdt@kline_1m',
    decimals: 2,
    minOrderQty: 0.001,
    defaultLot: 0.1,
  },
  'ETH/USD': {
    symbol: 'ETH/USD',
    name: 'Ethereum / USD',
    assetClass: 'CRYPTO',
    binanceStream: 'ethusdt@kline_1m',
    decimals: 2,
    minOrderQty: 0.01,
    defaultLot: 1.0,
  },
  'SOL/USD': {
    symbol: 'SOL/USD',
    name: 'Solana / USD',
    assetClass: 'CRYPTO',
    binanceStream: 'solusdt@kline_1m',
    decimals: 2,
    minOrderQty: 0.1,
    defaultLot: 10.0,
  },

  // Forex
  'EUR/USD': {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    assetClass: 'FOREX',
    decimals: 4,
    minOrderQty: 100,
    defaultLot: 1000,
  },
  'GBP/USD': {
    symbol: 'GBP/USD',
    name: 'British Pound / USD',
    assetClass: 'FOREX',
    decimals: 4,
    minOrderQty: 100,
    defaultLot: 1000,
  },

  // Commodities (Materie Prime)
  'XAU/USD': {
    symbol: 'XAU/USD',
    name: 'Oro (Gold) / USD',
    assetClass: 'COMMODITY',
    decimals: 2,
    minOrderQty: 0.1,
    defaultLot: 1.0,
  },
  'XAG/USD': {
    symbol: 'XAG/USD',
    name: 'Argento (Silver) / USD',
    assetClass: 'COMMODITY',
    decimals: 2,
    minOrderQty: 1.0,
    defaultLot: 10.0,
  },
  'WTI/USD': {
    symbol: 'WTI/USD',
    name: 'Petrolio Greggio (WTI Oil)',
    assetClass: 'COMMODITY',
    decimals: 2,
    minOrderQty: 1.0,
    defaultLot: 10.0,
  },

  // World Indices
  'NDX/USD': {
    symbol: 'NDX/USD',
    name: 'Nasdaq 100 Index',
    assetClass: 'INDEX',
    decimals: 2,
    minOrderQty: 0.1,
    defaultLot: 1.0,
  },
  'SPX/USD': {
    symbol: 'SPX/USD',
    name: 'S&P 500 Index',
    assetClass: 'INDEX',
    decimals: 2,
    minOrderQty: 0.1,
    defaultLot: 1.0,
  },

  // Stocks
  'AAPL/USD': {
    symbol: 'AAPL/USD',
    name: 'Apple Inc.',
    assetClass: 'STOCK',
    decimals: 2,
    minOrderQty: 1.0,
    defaultLot: 10.0,
  },
  'NVDA/USD': {
    symbol: 'NVDA/USD',
    name: 'NVIDIA Corp.',
    assetClass: 'STOCK',
    decimals: 2,
    minOrderQty: 1.0,
    defaultLot: 10.0,
  },
};

export const BINANCE_SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD'];
