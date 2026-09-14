# DATABASE SPECIFICATION — TRADING DEMO PLATFORM

## 1. Schema Design (Relational / PostgreSQL)

All monetary fields use fixed-point decimal precision (`DECIMAL(18, 4)` for cash/currencies, `DECIMAL(18, 8)` for asset quantities and asset prices) to eliminate floating-point imprecisions.

### Entity Schemas

#### 1. `users`
- `id` (UUID, Primary Key)
- `email` (VARCHAR 255, Unique, Indexed)
- `password_hash` (VARCHAR 255)
- `full_name` (VARCHAR 255)
- `role` (VARCHAR 32) -> `'USER' | 'ADMIN'`
- `status` (VARCHAR 32) -> `'ACTIVE' | 'SUSPENDED'`
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### 2. `accounts`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`, Indexed)
- `account_number` (VARCHAR 64, Unique)
- `currency` (VARCHAR 8, Default `'USD'`)
- `status` (VARCHAR 32, Default `'ACTIVE'`)
- `created_at` (TIMESTAMP WITH TIME ZONE)

#### 3. `balances`
- `id` (UUID, Primary Key)
- `account_id` (UUID, Foreign Key -> `accounts.id`, Unique)
- `cash_balance` (DECIMAL(18, 4), Default `10000.0000`)
- `reserved_balance` (DECIMAL(18, 4), Default `0.0000`)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### 4. `transactions`
- `id` (UUID, Primary Key)
- `account_id` (UUID, Foreign Key -> `accounts.id`, Indexed)
- `type` (VARCHAR 32) -> `'WELCOME_BONUS' | 'ADMIN_ADJUSTMENT' | 'TRADE_EXECUTION' | 'POSITION_CLOSE'`
- `amount` (DECIMAL(18, 4))
- `balance_after` (DECIMAL(18, 4))
- `description` (TEXT)
- `reference_id` (VARCHAR 64, Nullable)
- `created_at` (TIMESTAMP WITH TIME ZONE, Indexed)

#### 5. `assets`
- `id` (UUID, Primary Key)
- `symbol` (VARCHAR 32, Unique) -> `'BTC/USD', 'ETH/USD', 'SOL/USD', 'EUR/USD', 'AAPL'`
- `name` (VARCHAR 128)
- `asset_class` (VARCHAR 32) -> `'CRYPTO' | 'FOREX' | 'STOCK'`
- `base_price` (DECIMAL(18, 8))
- `min_order_qty` (DECIMAL(18, 8))
- `max_order_qty` (DECIMAL(18, 8))
- `is_active` (BOOLEAN, Default `TRUE`)

#### 6. `orders`
- `id` (UUID, Primary Key)
- `account_id` (UUID, Foreign Key -> `accounts.id`, Indexed)
- `asset_symbol` (VARCHAR 32, Indexed)
- `side` (VARCHAR 8) -> `'BUY' | 'SELL'`
- `type` (VARCHAR 16) -> `'MARKET'`
- `status` (VARCHAR 16) -> `'FILLED' | 'REJECTED' | 'CANCELLED'`
- `quantity` (DECIMAL(18, 8))
- `executed_price` (DECIMAL(18, 8))
- `notional_value` (DECIMAL(18, 4))
- `created_at` (TIMESTAMP WITH TIME ZONE, Indexed)

#### 7. `positions`
- `id` (UUID, Primary Key)
- `account_id` (UUID, Foreign Key -> `accounts.id`, Indexed)
- `asset_symbol` (VARCHAR 32, Indexed)
- `side` (VARCHAR 8) -> `'LONG' | 'SHORT'`
- `quantity` (DECIMAL(18, 8))
- `average_entry_price` (DECIMAL(18, 8))
- `status` (VARCHAR 16) -> `'OPEN' | 'CLOSED'`
- `realized_pnl` (DECIMAL(18, 4), Default `0.0000`)
- `opened_at` (TIMESTAMP WITH TIME ZONE)
- `closed_at` (TIMESTAMP WITH TIME ZONE, Nullable)

#### 8. `audit_logs`
- `id` (UUID, Primary Key)
- `actor_id` (UUID, Foreign Key -> `users.id`, Indexed)
- `actor_role` (VARCHAR 32)
- `action` (VARCHAR 64) -> `'ADD_DEMO_FUNDS' | 'REMOVE_DEMO_FUNDS' | 'SUSPEND_USER' | 'ACTIVATE_USER'`
- `target_entity` (VARCHAR 32)
- `target_id` (VARCHAR 64, Indexed)
- `state_before` (JSONB)
- `state_after` (JSONB)
- `ip_address` (VARCHAR 64)
- `created_at` (TIMESTAMP WITH TIME ZONE, Indexed)
