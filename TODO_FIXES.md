# 📋 Piano degli Interventi e Risoluzione Lacune — ApexTrader Platform
*Documento generato dall'analisi completa del codebase. Ordinato per priorità di intervento.*

---

## 🔴 PRIORITÀ P0 — Bachi Critici & Bloccanti (Crash a Runtime & Errori Finanziari)

Errori che causano eccezioni 500 a runtime, crash di SQLite o corruzione dei calcoli patrimoniali.

- [ ] **P0.1 — Risolvere il crash SQLite `no such column: p.created_at` nel CRM Admin**
  - **File:** [`server/src/modules/admin/admin.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/admin/admin.service.ts#L365-L374)
  - **Problema:** Nel metodo `getAllGlobalPositions()`, la query esegue `SELECT p.created_at ... ORDER BY p.created_at DESC`. La tabella `positions` (definita in [`server/src/core/database/db.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/core/database/db.ts#L87-L101)) non possiede `created_at`, bensì `opened_at`. Questo causa un errore 500 perenne quando l'amministratore apre la scheda "Posizioni" globali.
  - **Azione:** Sostituire `p.created_at` con `p.opened_at` (sia nella `SELECT` che nell'`ORDER BY`).

- [ ] **P0.2 — Risolvere il crash SQLite nell'apertura trade admin con data personalizzata**
  - **File:** [`server/src/modules/trading/trading.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/trading/trading.service.ts#L93)
  - **Problema:** Quando l'admin compila il campo "Data/Ora Esecuzione" in [`AdminTradeDesk.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/admin/user-detail/AdminTradeDesk.tsx#L43), il server tenta un `INSERT INTO positions (..., created_at) VALUES (..., ?)`. La colonna `created_at` non esiste nella tabella `positions`.
  - **Azione:** Sostituire `created_at` con `opened_at` nella query di inserimento posizioni.

- [ ] **P0.3 — Correggere la formula dell'Equity (Capitale Investito Scomparso)**
  - **File:** [`server/src/modules/portfolio/portfolio.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/portfolio/portfolio.service.ts#L163)
  - **Problema:** All'apertura di un trade, il controvalore viene scalato dalla cassa (`cashBalance`). La formula `equity = balance.cashBalance + totalUnrealizedPnL` non include il valore delle posizioni aperte. Se un utente con $10,000 acquista $4,000 di BTC, la sua equity scende istantaneamente a $6,000, facendo sparire $4,000 di patrimonio.
  - **Azione:** Aggiornare la formula dell'equity in:
    ```typescript
    const equity = balance.cashBalance + totalInvestedValue + totalUnrealizedPnL;
    ```
    (o allineare coerentemente il modello del conto a margine in cui il capitale iniziale non viene decurtato ma bloccato in `reservedBalance`).

- [ ] **P0.4 — Ripristinare l'invarianza del Ledger nello Seed Iniziale**
  - **File:** [`server/src/core/database/seed.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/core/database/seed.ts#L92-L123)
  - **Problema:** Per l'utente Alex Rivera viene impostato un saldo cassa di $10,000, ma viene contestualmente inserita una posizione aperta da $3,190 senza scalare la cassa né registrare la transazione `TRADE_EXECUTION` nel ledger, rompendo la consistenza contabile iniziale.
  - **Azione:** Scalare il controvalore dalla cassa iniziale ($10,000 - $3,190 = $6,810) e inserire la transazione di `TRADE_EXECUTION` con causale e saldo progressivo coerente, oppure rimuovere la posizione fittizia non coperta.

- [ ] **P0.5 — Evitare il congelamento (Freeze) di BTC/ETH/SOL in caso di errore Binance**
  - **File:** [`server/src/modules/market-data/simulatedMarketService.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/market-data/simulatedMarketService.ts#L88-L108)
  - **Problema:** Nel loop tick simulato, BTC, ETH e SOL vengono saltati perché delegati a Binance REST. Se Binance è offline, bloccato da restrizioni geografiche IP (es. server USA su Render/AWS che restituiscono HTTP 451) o rate-limitato, i prezzi rimangono completamente fermi. Inoltre `binanceInterval` perde il riferimento e non viene ripulito in `stopTickLoop()`.
  - **Azione:** 
    1. Memorizzare il timer `binanceInterval` e cancellarlo in `stopTickLoop()`.
    2. Aggiungere un flag o timestamp di ricezione: se Binance non risponde entro 8 secondi, applicare il Random Walk simulato anche a BTC/ETH/SOL per garantire continuità.

---

## 🟠 PRIORITÀ P1 — Sicurezza, Concorrenza & Integrità Dati

Vulnerabilità di concorrenza, mancanze di audit e sicurezza applicativa.

- [ ] **P1.1 — Eliminare la Race Condition sulle transazioni di saldo cassa**
  - **File:** [`server/src/modules/accounts/accounts.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/accounts/accounts.service.ts#L94-L122)
  - **Problema:** La lettura del saldo `getBalance()` e la verifica `freeBalance < amount` sono esterne al blocco `db.transaction()`. Richieste simultanee possono portare il saldo in negativo.
  - **Azione:** Spostare la lettura e la validazione dentro la transazione atomica SQLite (`db.transaction`), oppure inserire una condizione di guardia SQL: `WHERE account_id = ? AND cash_balance >= ?`.

- [ ] **P1.2 — Aggiungere i Listener mancanti nell'EventBus per l'Audit Trail**
  - **File:** [`server/src/core/events/eventBus.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/core/events/eventBus.ts#L16-L70)
  - **Problema:** Gli eventi `admin.order_date_updated`, `admin.transaction_date_updated` e `admin.user_created` emessi da [`admin.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/admin/admin.service.ts#L237) non hanno listener registrati e non vengono scritti in `audit_logs`.
  - **Azione:** Aggiungere in `eventBus.ts` gli handler `this.on('admin.order_date_updated', ...)` e `this.on('admin.transaction_date_updated', ...)` per registrare l'audit log di ogni modifica retroattiva e creazione utente.

- [ ] **P1.3 — Introdurre la validazione degli schemi con Zod**
  - **File:** [`server/src/modules/auth/auth.routes.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/auth/auth.routes.ts), [`server/src/modules/trading/client.routes.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/trading/client.routes.ts), [`server/src/modules/admin/admin.routes.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/admin/admin.routes.ts)
  - **Problema:** La libreria `zod` è presente in `package.json` ed è citata nelle linee guida di sicurezza, ma non è usata in nessun controller. Non c'è validazione su email, lunghezza minima password (attualmente accettate anche password di 1 carattere) e valori numerici (quantità ordini, importi fondi).
  - **Azione:** Creare middleware o schemi Zod per validare i payload di registrazione, login, creazione ordine e iniezione fondi.

- [ ] **P1.4 — Convertire Bcrypt in asincrono per non bloccare l'Event Loop**
  - **File:** [`server/src/modules/auth/auth.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/auth/auth.service.ts#L16-L71)
  - **Problema:** L'uso di `bcrypt.hashSync` e `bcrypt.compareSync` blocca il thread principale per oltre 100ms per operazione di auth.
  - **Azione:** Sostituire con `await bcrypt.hash(password, 10)` e `await bcrypt.compare(password, hash)`.

- [ ] **P1.5 — Gestione collisioni per la generazione del numero di conto**
  - **File:** [`server/src/modules/auth/auth.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/auth/auth.service.ts#L17)
  - **Problema:** `Math.floor(100000 + Math.random() * 900000)` ha solo 900k combinazioni. Se si genera un duplicato, la registrazione fallisce con violazione del vincolo UNIQUE.
  - **Azione:** Aggiungere un ciclo di retry (fino a 3 tentativi) o utilizzare una sequenza/nanoid con entropia maggiore.

- [ ] **P1.6 — Rimozione URL Render e segreti hardcoded**
  - **File:** [`server/src/server.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/server.ts#L28), [`server/src/config.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/config.ts#L8)
  - **Problema:** `https://apptest-oef2.onrender.com` è cablato come fallback del keep-alive pinger. `JWT_SECRET` ha un fallback insicuro di default.
  - **Azione:** Eseguire il keep-alive solo se `RENDER_EXTERNAL_URL` è definito e non nullo. Richiedere `JWT_SECRET` obbligatorio in ambiente di produzione.

---

## 🟡 PRIORITÀ P2 — Funzionalità Client, UX & Allineamento Business

Risoluzione dei componenti orfani, automazione TP/SL e coerenza operativa.

- [ ] **P2.1 — Attivare il form ordini client (Collegare l'hook orfano `useTradingDesk`)**
  - **File:** [`client/src/pages/client/DesktopTradingWorkspace.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/client/DesktopTradingWorkspace.tsx), [`client/src/hooks/useTradingDesk.ts`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/hooks/useTradingDesk.ts)
  - **Problema:** Il client dispone già di un hook completo `useTradingDesk` per piazzare ordini BUY/SELL e chiudere posizioni, ma non è collegato ad alcuna vista. Il cliente è relegato a mero spettatore senza poter testare il trading in autonomia come descritto in documentazione.
  - **Azione:** Inserire un pannello operativo opzionale o configurabile "Desk Ordini Cliente" in `DesktopTradingWorkspace` e `MobileTradingWorkspace`.

- [ ] **P2.2 — Worker server-side in background per Take Profit e Stop Loss**
  - **File:** [`server/src/modules/portfolio/portfolio.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/portfolio/portfolio.service.ts#L44-L55), [`server/src/server.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/server.ts)
  - **Problema:** TP e SL scattano solo come effetto collaterale quando viene interrogata la rotta `GET /positions`. Se nessun utente ha la scheda aperta, le posizioni non vengono mai chiuse a target.
  - **Azione:** Aggiungere un ticker autonomo sul server (es. ad ogni ciclo del `simulatedMarketService` o timer dedicato) che controlla le posizioni aperte e attiva la liquidazione automatica.

- [ ] **P2.3 — Collegare il saldo demo iniziale alle Platform Settings CMS**
  - **File:** [`server/src/modules/auth/auth.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/auth/auth.service.ts#L34-L36)
  - **Problema:** Il saldo iniziale è forzato a `$0.0` nel codice, ignorando l'impostazione `default_demo_balance` configurabile dal pannello Admin CMS e la documentazione ($10,000).
  - **Azione:** Leggere il valore da `SettingsService.getAllSettings().default_demo_balance` al momento della registrazione e accreditare l'importo iniziale con transazione `WELCOME_BONUS` nel ledger se maggiore di 0.

- [ ] **P2.4 — Correggere la logica di Reset Demo (`/client/reset-demo`)**
  - **File:** [`server/src/modules/trading/client.routes.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/trading/client.routes.ts#L73-L85)
  - **Problema:** L'endpoint aggiunge $10,000 cumulativi anziché ripristinare il saldo e non chiude le posizioni in essere.
  - **Azione:** Chiudere le posizioni aperte e impostare il saldo esattamente a $10,000 (o al valore di default del CMS) registrando la transazione `RESET`.

- [ ] **P2.5 — Persistenza progressi e certificati HTB Academy su Database**
  - **File:** [`client/src/pages/academy/HTBAcademyWorkspace.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/academy/HTBAcademyWorkspace.tsx#L31-L63)
  - **Problema:** I moduli completati, i punti XP e l'attestato finale risiedono unicamente nel `localStorage` del browser e si perdono cambiando dispositivo o ripulendo la cache.
  - **Azione:** Creare tabella `user_academy_progress` nel DB e relative rotte API (`GET /client/academy/progress`, `POST /client/academy/complete`) con sincronizzazione automatica.

- [ ] **P2.6 — Firma digitale e Hash SHA-256 reale nei PDF degli estratti conto**
  - **File:** [`client/src/services/pdfGenerator.ts`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/services/pdfGenerator.ts#L309)
  - **Problema:** La dicitura "SHA-256 Audit Hash" è generata con `Math.sin(...)`.
  - **Azione:** Utilizzare la Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`) per calcolare un hash esadecimale reale del contenuto del rendiconto.

---

## 🟢 PRIORITÀ P3 — DevOps, Persistenza Docker/Cloud & Allineamento Documentazione

Disallineamenti infrastrutturali e della documentazione tecnica.

- [ ] **P3.1 — Correggere il volume del database in `docker-compose.yml`**
  - **File:** [`docker-compose.yml`](file:///Users/marcopulcino/Desktop/demo1-main/docker-compose.yml#L13)
  - **Problema:** Il volume mappa `./server/trading.db:/app/server/trading.db`, mentre l'applicazione usa `/app/trading_demo.db`. Il database reale non viene salvato sull'host.
  - **Azione:** Aggiornare il mapping in:
    ```yaml
    volumes:
      - ./trading_demo.db:/app/trading_demo.db
    ```

- [ ] **P3.2 — Gestione persistenza SQLite su Render**
  - **File:** [`render.yaml`](file:///Users/marcopulcino/Desktop/demo1-main/render.yaml)
  - **Problema:** Il piano `free` di Render ha un filesystem effimero: i dati si azzerano ad ogni restart/deploy.
  - **Azione:** Aggiungere documentazione o configurazione per Render Disks (`disk: name: data, mountPath: /data`), oppure prevedere la transizione al driver PostgreSQL in produzione come pianificato nei documenti architetturali.

- [ ] **P3.3 — Allineare la documentazione tecnica (`/docs`) con il codice reale**
  - **File:** [`docs/API.md`](file:///Users/marcopulcino/Desktop/demo1-main/docs/API.md), [`docs/DATABASE.md`](file:///Users/marcopulcino/Desktop/demo1-main/docs/DATABASE.md), [`docs/SECURITY.md`](file:///Users/marcopulcino/Desktop/demo1-main/docs/SECURITY.md)
  - **Problema:** 
    - `API.md` elenca rotte inesistenti (`/auth/logout`, `/client/markets`) e omette rotte reali (`/admin/settings`, `/admin/positions`, `/analytics/*`).
    - `DATABASE.md` descrive schemi PostgreSQL e tipi non conformi a SQLite (`JSONB`, `TIMESTAMP WITH TIME ZONE`).
    - `SECURITY.md` promette cookie HttpOnly e Zod non ancora implementati.
  - **Azione:** Aggiornare i documenti per riflettere fedelmente l'architettura reale.

- [ ] **P3.4 — Estendere la suite di Test automatizzati**
  - **File:** [`tests/accounting.test.ts`](file:///Users/marcopulcino/Desktop/demo1-main/tests/accounting.test.ts), [`tests/e2e_flow.test.ts`](file:///Users/marcopulcino/Desktop/demo1-main/tests/e2e_flow.test.ts)
  - **Problema:** Attualmente ci sono solo 2 file di test. `accounting.test.ts` testa funzioni matematiche con variabili locali isolate senza testare i servizi reali (`portfolioService`, `accountsService`).
  - **Azione:** Aggiungere test di integrazione per:
    1. Calcolo reale di `getPortfolioSummary` con posizioni aperte e verifica dell'Equity.
    2. Blocco account e autorizzazione RBAC (tentativo di accesso utente sospeso o non admin su rotte admin).
    3. Scatto automatico Stop Loss / Take Profit.
