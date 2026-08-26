import Database from 'better-sqlite3';
import { CONFIG } from '../../config';

const db = new Database(CONFIG.DB_PATH);

// Enable WAL mode and foreign keys for high-performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Accounts Table
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      account_number TEXT UNIQUE NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'CLOSED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Balances Table
    CREATE TABLE IF NOT EXISTS balances (
      id TEXT PRIMARY KEY,
      account_id TEXT UNIQUE NOT NULL,
      cash_balance REAL NOT NULL DEFAULT 10000.0000,
      reserved_balance REAL NOT NULL DEFAULT 0.0000,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- 4. Transactions Ledger Table
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('WELCOME_BONUS', 'ADMIN_ADJUSTMENT', 'TRADE_EXECUTION', 'POSITION_CLOSE', 'RESET')),
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      description TEXT NOT NULL,
      reference_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- 5. Assets Table
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      asset_class TEXT NOT NULL CHECK(asset_class IN ('CRYPTO', 'FOREX', 'STOCK', 'COMMODITY', 'INDEX')),
      base_price REAL NOT NULL,
      min_order_qty REAL NOT NULL DEFAULT 0.001,
      max_order_qty REAL NOT NULL DEFAULT 100000.0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    -- 6. Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('BUY', 'SELL')),
      type TEXT NOT NULL DEFAULT 'MARKET' CHECK(type IN ('MARKET', 'LIMIT')),
      status TEXT NOT NULL CHECK(status IN ('FILLED', 'REJECTED', 'CANCELLED')),
      quantity REAL NOT NULL,
      executed_price REAL NOT NULL,
      notional_value REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- 7. Positions Table
    CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('LONG', 'SHORT')),
      quantity REAL NOT NULL,
      average_entry_price REAL NOT NULL,
      take_profit_price REAL,
      stop_loss_price REAL,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'CLOSED')),
      realized_pnl REAL NOT NULL DEFAULT 0.0000,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    -- 8. Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT NOT NULL,
      state_before TEXT,
      state_after TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 9. Platform Settings & Headless CMS Table
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Performance Indices
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_account_created ON transactions(account_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_account ON orders(account_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_positions_account ON positions(account_id, status);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
  `);

  try {
    db.prepare('ALTER TABLE positions ADD COLUMN take_profit_price REAL').run();
  } catch (_) {}
  try {
    db.prepare('ALTER TABLE positions ADD COLUMN stop_loss_price REAL').run();
  } catch (_) {}
}

export default db;
