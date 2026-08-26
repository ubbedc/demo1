# SECURITY GUIDELINES — TRADING DEMO PLATFORM

## 1. Authentication & Session Security
- **Password Hashing:** Passwords are never stored in plaintext. They are hashed using **Argon2id** or **Bcrypt (cost >= 12)**.
- **JWT & Tokens:** Tokens are signed with a cryptographically secure secret (`HS256`/`RS256`) and short expiration (15 minutes). Refresh tokens are stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.

## 2. Role-Based Access Control (RBAC)
- All client endpoints enforce the authenticated `USER` role and isolate queries to `req.user.accountId`.
- All admin endpoints under `/api/v1/admin/*` strictly enforce `req.user.role === 'ADMIN'`.

## 3. Data Integrity & Validation
- Strict request schema validation via **Zod** on all incoming payloads before reaching business logic.
- Atomic SQL transactions (`BEGIN ... COMMIT`) to prevent race conditions during order execution, balance updates, and position closure.

## 4. Rate Limiting & Protection
- Public endpoints (`/auth/login`, `/auth/register`) are rate-limited to prevent brute-force attacks.
- Order execution endpoints are throttled to prevent spamming.
- Standard security headers enabled via **Helmet** (CSP, HSTS, X-Frame-Options: DENY).
