import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db, { initDatabase } from './db';

export function seedDatabase() {
  initDatabase();

  // Ensure default platform settings exist
  const defaultSettings = [
    { key: 'platform_name', value: 'ApexTrader' },
    { key: 'platform_tagline', value: 'Institutional Platform' },
    { key: 'hero_headline', value: 'Trading Istituzionale. Esecuzione & Capitale Protetto.' },
    { key: 'hero_subtitle', value: 'Infrastruttura finanziaria avanzata per il monitoraggio di strategie quantitative, rendicontazione a doppia partita contabile e trading gestito da Desk centrale, con feed mondiali in streaming continuo ed estratti conto certificati.' },
    { key: 'announcement_banner_enabled', value: '1' },
    { key: 'announcement_banner_text', value: '🔥 APEX ENGINE 2.0 • FEED GLOBALE SUB-MILLISECONDO ATTIVO' },
    { key: 'registrations_enabled', value: '1' },
    { key: 'default_demo_balance', value: '0.00' },
    { key: 'support_email', value: 'desk@apextrader.demo' },
    { key: 'support_telegram', value: '@ApexTraderDesk' },
    { key: 'show_comparison_section', value: '1' },
    { key: 'show_faq_section', value: '1' },
    { key: 'show_journey_section', value: '1' },
    { key: 'show_tech_pillars_section', value: '1' },
    { key: 'theme_color_primary', value: 'cyan' },
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO platform_settings (key, value) VALUES (?, ?)
  `);

  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('⚡ Database already seeded.');
    return;
  }

  console.log('🌱 Seeding database with initial assets, Admin CRM user, and demo trader...');

  // 1. Seed Tradable Assets
  const insertAsset = db.prepare(`
    INSERT INTO assets (id, symbol, name, asset_class, base_price, min_order_qty, max_order_qty, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialAssets = [
    { id: uuidv4(), symbol: 'BTC/USD', name: 'Bitcoin / USD', asset_class: 'CRYPTO', base_price: 64250.0, min: 0.001, max: 10.0 },
    { id: uuidv4(), symbol: 'ETH/USD', name: 'Ethereum / USD', asset_class: 'CRYPTO', base_price: 3480.0, min: 0.01, max: 100.0 },
    { id: uuidv4(), symbol: 'SOL/USD', name: 'Solana / USD', asset_class: 'CRYPTO', base_price: 148.5, min: 0.1, max: 500.0 },
    { id: uuidv4(), symbol: 'EUR/USD', name: 'Euro / US Dollar', asset_class: 'FOREX', base_price: 1.0845, min: 100.0, max: 100000.0 },
    { id: uuidv4(), symbol: 'GBP/USD', name: 'British Pound / USD', asset_class: 'FOREX', base_price: 1.295, min: 100.0, max: 100000.0 },
    { id: uuidv4(), symbol: 'AAPL/USD', name: 'Apple Inc.', asset_class: 'STOCK', base_price: 228.4, min: 1.0, max: 1000.0 },
    { id: uuidv4(), symbol: 'NVDA/USD', name: 'NVIDIA Corp.', asset_class: 'STOCK', base_price: 124.8, min: 1.0, max: 1000.0 },
    { id: uuidv4(), symbol: 'XAU/USD', name: 'Oro (Gold) / USD', asset_class: 'COMMODITY', base_price: 2650.0, min: 0.1, max: 500.0 },
    { id: uuidv4(), symbol: 'XAG/USD', name: 'Argento (Silver) / USD', asset_class: 'COMMODITY', base_price: 31.80, min: 1.0, max: 5000.0 },
    { id: uuidv4(), symbol: 'WTI/USD', name: 'Petrolio Greggio (WTI Oil)', asset_class: 'COMMODITY', base_price: 74.50, min: 1.0, max: 5000.0 },
    { id: uuidv4(), symbol: 'NDX/USD', name: 'Nasdaq 100 Index', asset_class: 'INDEX', base_price: 19850.0, min: 0.1, max: 100.0 },
    { id: uuidv4(), symbol: 'SPX/USD', name: 'S&P 500 Index', asset_class: 'INDEX', base_price: 5780.0, min: 0.1, max: 100.0 },
  ];

  for (const a of initialAssets) {
    insertAsset.run(a.id, a.symbol, a.name, a.asset_class, a.base_price, a.min, a.max, 1);
  }

  // 2. Create Admin Account
  const adminId = uuidv4();
  const adminPassHash = bcrypt.hashSync('prova123', 10);
  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(adminId, 'prova@gmail.com', adminPassHash, 'Chief Executive Admin', 'ADMIN', 'ACTIVE');

  // 3. Create Demo Trader Account
  const traderId = uuidv4();
  const traderPassHash = bcrypt.hashSync('Trader123!', 10);
  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(traderId, 'trader@apextrader.demo', traderPassHash, 'Alex Rivera', 'USER', 'ACTIVE');

  // Create Trader Account Wallet
  const accountId = uuidv4();
  const accNumber = 'APX-' + Math.floor(100000 + Math.random() * 900000);
  db.prepare(`
    INSERT INTO accounts (id, user_id, account_number, currency, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(accountId, traderId, accNumber, 'USD', 'ACTIVE');

  // Initialize Balance ($10,000)
  db.prepare(`
    INSERT INTO balances (id, account_id, cash_balance, reserved_balance)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), accountId, 10000.0, 0.0);

  // Initial Welcome Bonus Transaction
  db.prepare(`
    INSERT INTO transactions (id, account_id, type, amount, balance_after, description, reference_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    accountId,
    'WELCOME_BONUS',
    10000.0,
    10000.0,
    'Initial Demo Welcome Capital Allocation',
    null
  );

  // Initial Sample Executed Order & Position for Demo experience
  const orderId = uuidv4();
  db.prepare(`
    INSERT INTO orders (id, account_id, asset_symbol, side, type, status, quantity, executed_price, notional_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderId, accountId, 'BTC/USD', 'BUY', 'MARKET', 'FILLED', 0.05, 63800.0, 3190.0);

  db.prepare(`
    INSERT INTO positions (id, account_id, asset_symbol, side, quantity, average_entry_price, status, realized_pnl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), accountId, 'BTC/USD', 'LONG', 0.05, 63800.0, 'OPEN', 0.0);

  // Log Initial Audit Entry
  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_role, action, target_entity, target_id, state_before, state_after, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    adminId,
    'ADMIN',
    'SYSTEM_BOOTSTRAP',
    'SYSTEM',
    'GLOBAL',
    null,
    JSON.stringify({ note: 'Initial system seed completed with default assets and demo users' }),
    '127.0.0.1'
  );

  console.log('✅ Seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase();
}
