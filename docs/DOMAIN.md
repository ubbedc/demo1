# DOMAIN ARCHITECTURE & RULES — TRADING DEMO PLATFORM

## 1. Domain Boundaries (DDD-Lite)

### 1.1 Auth & Identity Domain
- **Responsibilities:** User registration, password hashing (Argon2id/Bcrypt), JWT generation and verification, session invalidation.
- **Rules:** Passwords never logged; accounts created with default active status and `USER` role.

### 1.2 Account & Ledger Domain
- **Responsibilities:** Management of cash balance, free balance, and transaction history.
- **Rules:** Double-entry ledger consistency. Every change in balance produces an immutable `Transaction` entry. Balances cannot drop below zero unless explicitly sanctioned.

### 1.3 Demo Trading Domain
- **Responsibilities:** Order validation, real-time market pricing execution, position creation, fill recording.
- **Order State Lifecycle:** `CREATED` -> `VALIDATED` -> `EXECUTING` -> `FILLED` (or `REJECTED` / `FAILED`).

### 1.4 Portfolio & PnL Engine
- **Mathematical Formulations:**
  - **Notional Value:** $\text{Quantity} \times \text{Current Price}$
  - **Weighted Average Entry Price (WAP):** $\frac{\sum(\text{Qty}_i \times \text{Price}_i)}{\sum \text{Qty}_i}$
  - **Unrealized P/L (Long):** $(\text{Bid Price} - \text{Avg Entry Price}) \times \text{Quantity}$
  - **Unrealized P/L (Short):** $(\text{Avg Entry Price} - \text{Ask Price}) \times \text{Quantity}$
  - **Equity:** $\text{Cash Balance} + \sum \text{Unrealized PnL}$
  - **Free Balance:** $\text{Cash Balance} - \text{Reserved Funds}$

### 1.5 Market Data Provider Domain
- **Contract Interface:**
  ```typescript
  export interface MarketQuote {
    symbol: string;
    bid: number;
    ask: number;
    last: number;
    change24h: number;
    timestamp: number;
  }

  export interface IMarketDataProvider {
    getQuote(symbol: string): MarketQuote | null;
    getAllQuotes(): MarketQuote[];
  }
  ```

### 1.6 Admin CRM & Audit Domain
- **Responsibilities:** User status overrides, manual demo fund injections/deductions, full audit log capture.
- **Audit Rule:** Every mutating admin action (`ADD_FUNDS`, `SUSPEND_USER`, etc.) MUST record an immutable event containing `actorId`, `targetId`, `action`, `stateBefore`, `stateAfter`, and `ipAddress`.
