export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  accountId?: string;
  accountNumber?: string;
}

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

export interface PortfolioSummary {
  accountId: string;
  currency: string;
  cashBalance: number;
  freeBalance: number;
  reservedBalance: number;
  totalInvestedValue: number;
  totalUnrealizedPnL: number;
  equity: number;
  openPositionsCount: number;
}

export interface Position {
  id: string;
  accountId: string;
  assetSymbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  takeProfitPrice?: number | null;
  stopLossPrice?: number | null;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  notionalValue: number;
  status: 'OPEN' | 'CLOSED';
  realizedPnL: number;
  openedAt: string;
  closedAt: string | null;
}

export interface Order {
  id: string;
  accountId: string;
  asset_symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  status: 'FILLED' | 'REJECTED' | 'CANCELLED';
  quantity: number;
  executed_price: number;
  notional_value: number;
  created_at: string;
  executed_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalPositions: number;
  totalOrders: number;
  totalVolume: number;
  totalAllocatedDemoFunds: number;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target_entity: string;
  target_id: string;
  state_before: string;
  state_after: string;
  ip_address: string;
  created_at: string;
}

export interface PlatformSettings {
  platform_name: string;
  platform_tagline: string;
  hero_headline: string;
  hero_subtitle: string;
  announcement_banner_enabled: boolean;
  announcement_banner_text: string;
  registrations_enabled: boolean;
  default_demo_balance: number;
  support_email: string;
  support_telegram: string;
  show_comparison_section: boolean;
  show_faq_section: boolean;
  show_journey_section: boolean;
  show_tech_pillars_section: boolean;
  theme_color_primary: string;
  google_tag_id?: string;
}

export interface LeadRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  experience_level: string;
  source: string;
  module_id: string | null;
  module_title: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  notes: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  phoneCapturedCount: number;
  phoneCaptureRate: number;
}

