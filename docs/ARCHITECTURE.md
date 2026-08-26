# SYSTEM ARCHITECTURE — TRADING DEMO PLATFORM

## 1. Architectural Philosophy: Simple Now, Scalable Later
The platform is built as a **Modular Monolith** with clear domain boundaries (DDD-lite). This eliminates network latency, deployment overhead, and premature distributed systems complexity while guaranteeing future modular extraction.

## 2. High-Level System Architecture

```
+-------------------------------------------------------------------------------+
|                             PRESENTATION LAYER                                |
|                                                                               |
|   +---------------------+   +---------------------+   +-------------------+   |
|   |     PUBLIC WEB      |   |   CLIENT PLATFORM   |   |     ADMIN CRM     |   |
|   |  (Landing / Auth)   |   | (Trading Dashboard) |   | (User / Ops Mgmt) |   |
|   +---------------------+   +---------------------+   +-------------------+   |
+-------------------------------------------------------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------------+
|                       API ROUTING & SECURITY GATEWAY                          |
|         CORS / Rate Limiting / JWT Auth & RBAC Verification Middleware        |
+-------------------------------------------------------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------------+
|                       BACKEND CORE (MODULAR MONOLITH)                         |
|                                                                               |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  |    Auth Module     |  |    Users Module    |  |  Accounts/Ledger Module |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|                                                                               |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | Demo Trading Module|  |  Portfolio Engine  |  |  Market Data (Simulated)|  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|                                                                               |
|  +--------------------+  +--------------------+                               |
|  |  Admin CRM Service |  |    Audit Engine    |                               |
|  +--------------------+  +--------------------+                               |
+-------------------------------------------------------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                                |
|             Relational Database (PostgreSQL / Strict Decimal Precision)       |
+-------------------------------------------------------------------------------+
```

## 3. Future Scalability & Extraction
Each module communicates via strongly-typed service interfaces. When traffic requires:
- **Market Data:** Can be decoupled to a WebSocket pub/sub cluster (Redis/Kafka).
- **Trading Engine:** Can be extracted into a standalone high-throughput matching service.
- **Broker Gateway:** Can be attached as an external adapter implementing `ITradingGateway`.
