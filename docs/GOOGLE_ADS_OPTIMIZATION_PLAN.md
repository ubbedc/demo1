# Piano Operativo Google Ads & Conversion Rate Optimization (CRO)
## ApexTrader Quant Academy — Da Piattaforma a Macchina di Lead Generation

---

## 🎯 Visione & Obiettivi di Business

L'obiettivo delle future campagne Google Ads è acquisire **lead e utenti qualificati al minor Costo Per Acquisizione (CPA) possibile**, sfruttando l'Accademia e i suoi simulatori matematici interattivi come **Lead Magnet ad altissimo valore percepito**.

Nel settore del trading e della finanza quantitativa, il traffico paid su Google Ads presenta tre sfide critiche:
1. **Costo Per Click (CPC) elevato** (1,50 € – 5,00 €/click).
2. **Policy restrittive di Google** sui prodotti finanziari, CFD e crypto (rischio ban/sospensione account se mancano disclaimer o pagine legali).
3. **Dispersione del traffico (Bounce Rate)** se l'annuncio non indirizza l'utente esattamente sullo strumento pubblicizzato (es. click su annuncio *"Calcolo Leva"* che atterra sulla generica homepage).

Questo piano trasforma l'architettura tecnica per renderla **100% pronta e conforme per Google Ads**.

---

## 🏗️ I 5 Pilastri Tecnici dell'Implementazione

```
   GOOGLE ADS CAMPAIGN
(Search / PMax / YouTube)
          │
          ▼
   [ 1. DEEP LINKING URL ] ─────────► Apre direttamente il Modulo/Simulatore specifico
          │
          ▼
   [ 2. INTERACTIVE ENGAGEMENT ] ───► L'utente usa lo slider (Zero attrito iniziale)
          │
          ▼
   [ 3. LEAD MAGNET VALUE GATE ] ───► "Scarica Dispensa PDF" / "Salva XP e Certificato"
          │                           └─► Raccoglie: Nome, Email, Livello Esperienza
          ▼
   [ 4. DATA TRACKING ENGINE ] ─────► Google Tag (GA4/GAds) + CRM Interno (`generate_lead`)
          │
          ▼
   [ 5. TRADING SANDBOX BRIDGE ] ───► Apertura Conto Demo $10k (Conversione Finale)
```

---

## 1. Deep Linking & URL Routing Dinamico

### Problema Attuale
Attualmente l'app in [`client/src/App.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/App.tsx) inizializza lo stato con `activeView = 'landing'`. Qualsiasi URL esterno (es. `https://tuosito.com/academy` o `https://tuosito.com/?module=MOD-07`) viene ignorato, atterrando l'utente sulla homepage generica.

### Soluzione Tecnica
Implementare un router leggero e reattivo basato sull'URL del browser (`window.location.pathname`, `window.location.search` e history API):
- **Supporto URL:**
  - `/?view=academy` oppure `/academy`: apre direttamente la Quant Academy.
  - `/?view=academy&mod=MOD-07` oppure `/academy/MOD-07`: apre la Quant Academy e solleva istantaneamente la modale con il **Simulatore di Leva e Liquidazione**.
  - `/?view=academy&mod=MOD-02`: apre direttamente il **Simulatore Spread Bid/Ask**.
  - `/?view=academy&mod=MOD-08`: apre direttamente il **Calcolatore Position Sizing 1%**.
- **Sincronizzazione URL (`pushState` / `popstate`):**
  - Quando l'utente naviga tra le viste o chiude/apre un modulo, l'URL del browser si aggiorna in modo fluido e pulito senza ricaricare la pagina.
  - Il tasto "Indietro" del browser funziona perfettamente.

---

## 2. Lead Magnet & Sistema di Cattura Lead ("Value Exchange")

Per non sprecare i click a pagamento, integriamo **3 punti di conversione strategici**:

### A. Lead Magnet 1: "Scarica Dispensa PDF Ufficiale" (Soft-Gate)
- Quando un utente non registrato clicca su *"Dispensa PDF"* nel lettore del modulo, invece di scaricare anonimamente il file, si apre una modale elegante:
  - *"Ricevi il Compendio Ufficiale e il Foglio di Calcolo in formato PDF"*
  - Campi: Nome, Email.
  - Checkbox opzionale: *"Desidero ricevere analisi settimanali sui mercati e aggiornamenti didattici"*.
- All'invio:
  - Il PDF viene generato e scaricato immediatamente a schermo.
  - Il lead viene registrato nel database (`leads` / `visitor_events`).
  - Viene inviato l'evento di conversione a Google Ads (`generate_lead`).

### B. Lead Magnet 2: "Salva i tuoi Progressi XP & Riscatta il Diploma"
- Se un visitatore anonimo completa un quiz/challenge e accumula XP, un banner non invasivo suggerisce:
  - *"Hai accumulato +150 XP! Crea il tuo account gratuito in 10 secondi per salvare i tuoi progressi e sbloccare la Certificazione Istituzionale finale"*.

### C. Lead Magnet 3: "Attiva Terminale Sandbox $10,000"
- Nel 3° tab (Challenge) e nel banner finale dell'Academy:
  - Un pulsante CTA prominente invita a mettere in pratica la teoria nel mercato reale simulato: *"Attiva Terminale Operativo con $10,000 Demo"*.
  - Apre la registrazione precompilata con attivazione immediata.

---

## 3. Motore di Tracciamento & Dati (Google Ads, GA4, CRM)

### Tracciamento Esterno (Google Tag / GTM)
- Creazione di un helper dedicato [`client/src/services/marketingTracker.ts`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/services/marketingTracker.ts):
  - Verifica la presenza di `gtag` o `dataLayer` di Google Tag Manager.
  - Invio eventi standard conformi a Google Analytics 4 e Google Ads:
    - `page_view`: con parametro `page_path` e `campaign_id`.
    - `view_item`: quando viene aperto un modulo specifico (es. `MOD-07`).
    - `simulator_interaction`: micro-conversione quando l'utente muove gli slider (leva, spread, risk sizing).
    - `generate_lead`: macro-conversione quando viene lasciata l'email per il PDF.
    - `sign_up`: macro-conversione primaria quando viene creato il conto demo.
    - `course_complete`: quando viene sbloccato il certificato.
- **Configurabilità da CMS Admin:**
  - Aggiunta del campo `google_tag_id` (es. `G-XXXXXXXXXX` o `AW-XXXXXXXXXX`) nelle Platform Settings dell'amministratore, così da poter attivare o cambiare il tag Google senza ri-compilare il codice.

### Tracciamento Interno (CRM Desk)
- Tutti gli eventi di marketing vengono registrati anche nella tabella SQLite `visitor_events` già esistente, permettendo all'amministratore di monitorare in tempo reale dal CRM:
  - Quanti utenti da Google Ads stanno navigando l'Academy.
  - Quali moduli e simulatori attirano più interazioni.
  - Lista dei lead catturati con timestamp e modulo di provenienza.

---

## 4. Conformità Policy Google Ads & Protezione Account

Google sospende immediatamente gli account che promuovono corsi di trading o piattaforme senza le necessarie tutele legali.

### A. Risk Disclaimer Obbligatorio & Visibile
- Inserimento di un banner permanente a fondo pagina su **tutte le viste** (Landing, Academy e Terminale):
  > *"Avviso di Rischio & Natura Didattica: ApexTrader è una piattaforma didattica e di simulazione tecnologica al 100% in ambiente demo. Non raccogliamo capitali reali, non gestiamo conti fiduciari né forniamo consulenza o raccomandazioni d'investimento. I risultati passati o simulati non costituiscono garanzia di rendimenti futuri."*

### B. Modali Legali Istituzionali
- Creazione di modali o pagine accessibili dal footer:
  - **Privacy Policy** (GDPR compliant).
  - **Termini e Condizioni di Utilizzo**.
  - **Metodologia Didattica & Trasparenza**.
- Questo assicura che il bot di revisione di Google Ads approvi gli annunci senza obiezioni.

---

## 5. Ottimizzazione Mobile-First & Quality Score

- Il **70-80%** del traffico paid da Search e YouTube avviene da smartphone.
- Tutti i nuovi simulatori ([`AcademySimulators.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/academy/components/AcademySimulators.tsx)) devono avere:
  - Aree di tocco (*touch targets*) per slider e bottoni di almeno 44px.
  - Prevenzione dello scorrimento accidentale della pagina durante il trascinamento degli slider.
  - Tipografia scalabile per schermi compatti (iPhone SE / schermi 375px).

---

## 📋 Tabella File e Modifiche Previste

| Componente | Azione | File | Descrizione |
| :--- | :--- | :--- | :--- |
| **Routing / Deep Linking** | `MODIFY` | [`client/src/App.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/App.tsx) | Parsing di `pathname` e query string (`mod`, `view`), sincronizzazione `pushState`/`popstate` |
| **Academy Workspace** | `MODIFY` | [`client/src/pages/academy/HTBAcademyWorkspace.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/academy/HTBAcademyWorkspace.tsx) | Accetta parametro `initialModuleId` per apertura automatica via deep-link |
| **Marketing Tracker** | `NEW` | [`client/src/services/marketingTracker.ts`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/services/marketingTracker.ts) | Dispatcher per Google Ads (`gtag`), GA4 e telemetria interna |
| **Lead Capture Modal** | `NEW` | [`client/src/pages/academy/components/AcademyLeadCaptureModal.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/academy/components/AcademyLeadCaptureModal.tsx) | Modale elegante di cattura email per download PDF e salvataggio certificato |
| **Reader Modal Hook** | `MODIFY` | [`client/src/pages/academy/HTBModuleReaderModal.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/pages/academy/HTBModuleReaderModal.tsx) | Trigger del Lead Magnet al click su "Dispensa PDF" per utenti anonimi |
| **Legal & Risk Footer** | `NEW` | [`client/src/components/common/InstitutionalFooter.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/components/common/InstitutionalFooter.tsx) | Footer unificato con Risk Disclaimer esplicito e modali legali (Privacy, Termini) |
| **Legal Modals** | `NEW` | [`client/src/components/common/LegalPolicyModal.tsx`](file:///Users/marcopulcino/Desktop/demo1-main/client/src/components/common/LegalPolicyModal.tsx) | Visualizzatore testi legali (Privacy, Termini, Cookie, Disclaimer) |
| **Settings Schema** | `MODIFY` | [`server/src/modules/admin/settings.service.ts`](file:///Users/marcopulcino/Desktop/demo1-main/server/src/modules/admin/settings.service.ts) | Aggiunta campo `google_tag_id` |

---

## 🧪 Piano di Verifica e Collaudo

1. **Test Deep Linking:**
   - Navigazione a `http://localhost:5173/?view=academy&mod=MOD-07`: verificare che la modale di Leva e Liquidazione si apra immediatamente.
   - Navigazione a `http://localhost:5173/?view=academy&mod=MOD-02`: verificare apertura immediata dello Spread.
   - Test pulsante "Indietro" del browser.
2. **Test Lead Capture & PDF:**
   - Cliccare su "Dispensa PDF" da utente non loggato: verificare l'apertura della modale di cattura email.
   - Inserire email di test e verificare che il PDF venga scaricato e che l'evento sia registrato.
3. **Test Tracciamento Eventi:**
   - Interagire con lo slider della leva e verificare che l'evento micro-conversione venga emesso.
4. **Verifica Compilazione e Test:**
   - `npx tsc --noEmit` con 0 errori.
   - `npm test` con 7/7 test superati.
   - `npm run build` con generazione corretta del bundle di produzione.
