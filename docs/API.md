# API SPECIFICATION — TRADING DEMO PLATFORM

## 1. Protocol & Conventions
- **Base URL:** `/api/v1`
- **Data Format:** JSON (`application/json`)
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>` or Secure HTTP-Only Session Cookie.

## 2. Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-08-25T13:00:00.000Z",
    "requestId": "req_12345"
  }
}
```

## 3. Endpoints Directory

### 3.1 Auth & Public API
- `POST /api/v1/auth/register` — Create a new user account + auto-provision demo wallet.
  - Body: `{ email, password, fullName }`
- `POST /api/v1/auth/login` — Authenticate and receive JWT token + user profile.
  - Body: `{ email, password }`
- `GET /api/v1/auth/me` — Return current authenticated user details.
- `POST /api/v1/auth/logout` — Invalidate current session.

### 3.2 Client Platform API (Requires `USER` role)
- `GET /api/v1/client/portfolio` — Current Equity, Cash Balance, Free Balance, Unrealized PnL, Realized PnL.
- `GET /api/v1/client/positions` — Active open positions with live calculated Unrealized PnL.
- `POST /api/v1/client/positions/:id/close` — Close open position at market price and settle realized PnL to balance.
- `GET /api/v1/client/orders` — History of submitted and executed orders.
- `POST /api/v1/client/orders` — Submit a new market order (`BUY` / `SELL`).
  - Body: `{ symbol: "BTC/USD", side: "BUY", quantity: 0.5 }`
- `GET /api/v1/client/transactions` — History of financial transactions and balance adjustments.
- `GET /api/v1/client/markets` — Live simulated quotes for all tradable assets.

### 3.3 Admin CRM API (Requires `ADMIN` role)
- `GET /api/v1/admin/dashboard` — Platform overview metrics (total users, total equity, active positions, 24h volume).
- `GET /api/v1/admin/users` — Paginated user directory with search/filters.
- `GET /api/v1/admin/users/:id` — 360° User profile including balance, transactions, positions, and order history.
- `POST /api/v1/admin/users/:id/funds` — Inject or deduct demo funds.
  - Body: `{ amount: 5000.00, type: "ADD" | "REMOVE", reason: "Support grant" }`
  - Produces mandatory Audit Log.
- `PATCH /api/v1/admin/users/:id/status` — Suspend or activate user.
  - Body: `{ status: "ACTIVE" | "SUSPENDED", reason: "Terms violation" }`
  - Produces mandatory Audit Log.
- `GET /api/v1/admin/audit-logs` — Immutable audit log explorer with filtering.
