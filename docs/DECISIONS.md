# ARCHITECTURAL DECISION RECORDS (ADRs)

## ADR-001: Modular Monolith Architecture
- **Status:** Accepted
- **Context:** We need a rapid, maintainable MVP that can scale cleanly without distributed systems overhead.
- **Decision:** Build the backend as a single deployable application structured into strictly bounded domain modules (`auth`, `users`, `accounts`, `trading`, `portfolio`, `market-data`, `admin`, `audit`).
- **Consequences:** Simple development, straightforward transactional integrity, zero network RPC latency. Clean interfaces allow extracting modules into standalone microservices later if load demands.

## ADR-002: Double-Entry Ledger Principles for Balances
- **Status:** Accepted
- **Context:** Balance updates in financial systems must be 100% auditable and reproducible.
- **Decision:** Every modification to cash balance must be accompanied by an immutable record in the `transactions` table. No silent balance overrides.
- **Consequences:** Absolute traceability and resilience against discrepancies.

## ADR-003: Interface-Driven Market Data Provider
- **Status:** Accepted
- **Context:** The MVP uses simulated prices, but future versions will integrate real broker/exchange feeds.
- **Decision:** Create an abstract `IMarketDataProvider` interface. The trading engine depends strictly on this interface, not the concrete simulated generator.
- **Consequences:** Swapping from simulation to live feeds (Binance, Alpaca) requires zero refactoring of trading logic.

## ADR-004: Unified Modern Fullstack Monolith with Clean Layouts
- **Status:** Accepted
- **Context:** Need clean separation between Public Web, Client Trading Platform, and Admin CRM with high-performance responsive UI.
- **Decision:** Single codebase with route-level security guards and domain-specific view hierarchies.
- **Consequences:** Cohesive shared design tokens, isolated security perimeters, zero cross-contamination.
