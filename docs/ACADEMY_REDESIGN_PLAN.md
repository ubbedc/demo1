# 📋 Piano di Implementazione — Restyling Completo UI/UX Quant Academy

Riprogettazione dell'interfaccia grafica e dell'esperienza utente della **Quant Academy** per trasformarla da un catalogo statico con "muro di testo" in un'esperienza formativa istituzionale, moderna, dinamica e coinvolgente.

---

## 🎯 Obiettivi del Restyling

1. **Eliminazione dello scroll infinito nel lettore del modulo:** Suddividere i contenuti in **3 Step logici guidati** (Teoria ➔ Formule & Simulatore ➔ Challenge & Lab).
2. **Tipografia e leggibilità istituzionale:** Sostituire il font monospace nei paragrafi di studio con un font *sans-serif* moderno (`Inter` / `system-ui`) arioso e ad alta leggibilità, riservando il monospace unicamente a formule, codici, ID e valori finanziari.
3. **Card Moduli in Glassmorphism & Roadmap:** Ridisegnare le card del catalogo con sfumature satinato-scure, bordi neon e vista a percorso a tappe (*Learning Path / Skill Tree*).
4. **Simulatori Matematici Dinamici:** Integrare mini-widget interattivi (es. slider Spread Bid/Ask, simulatore di Leva/Margine, calcolatore Position Sizing) per rendere le formule pratiche e visive prima di rispondere ai quiz.

---

## 🔍 Dettaglio delle Modifiche

### 1. Ristrutturazione del Lettore Modulo (`HTBModuleReaderModal.tsx`)
- **Navigazione a 3 Tab superiori:**
  1. `Tab 1: 📘 Fondamenti & Teoria` — Spiegazione del concetto, introduzione e punti chiave istituzionali (*Takeaways*).
  2. `Tab 2: 📐 Laboratorio Matematico & Caso Studio` — Formula in risalto, caso studio pratico reale e **mini-simulatore interattivo dedicato** per il modulo selezionato.
  3. `Tab 3: 🎯 Terminale & Flag Challenge` — Laboratorio Sandbox (tasto per aprire il grafico del simbolo bersaglio) e form per inserire la flag con feedback sonoro/visivo di vittoria XP.
- **Tipografia moderna:** Testo in sans-serif moderno, interlinea rilassata e box informativi con gradienti soft (cyan, emerald, amber).
- **Controlli inferiori:** Pulsanti "Avanti: Prossimo Step" con indicatore di progresso visivo (1/3, 2/3, 3/3).

---

### 2. Creazione Componente Simulatori Matematici (`AcademySimulators.tsx`)
Un componente leggero e dinamico posizionato nel Tab 2 del lettore, che adatta il simulatore visivo in base al modulo:
- **Modulo MOD-02 (Spread & Order Book):** Slider bid/ask interattivo che mostra in tempo reale l'ampiezza dello spread in dollari e in pips e il costo di ingresso.
- **Modulo MOD-07 (Leva & Liquidazione):** Slider leva (1x, 2x, 5x, 10x, 50x) con barra grafica che mostra dove si sposta il prezzo di liquidazione e il margine richiesto.
- **Modulo MOD-08 (Position Sizing 1%):** Calcolatore interattivo con saldo conto, percentuale di rischio e stop loss, che calcola automaticamente la quantità esatta di lotti/frazioni da negoziare.
- **Fallback generico:** Per gli altri moduli, un box formula interattivo con calcolo istantaneo del valore nozionale o WAP.

---

### 3. Rinnovamento Catalogo & Workspace (`HTBAcademyWorkspace.tsx`)
- **Header Studente Istituzionale:**
  - Avatar con badge del grado attuale (*Cadet Market Analyst*, *Desk Junior Operator*, *Senior Risk Specialist*, *Institutional Quant Master*).
  - Barra XP animata con target al livello successivo.
  - Card di anteprima miniatura del Diploma con timbro che si illumina all'ottenimento del 100%.
- **Selettore Vista:** Toggle per visualizzare i moduli come **Griglia Glassmorphism** oppure come **Learning Path a Tappe (Roadmap)**.
- **Card dei Moduli ridisegnate:**
  - Effetto vetro satinato scuro con bordo reattivo all'hover (cyan / emerald per i completati).
  - Indicatore di completamento visivo elegante (cerchio di progresso neon).
  - Tipografia moderna sans-serif per titoli e descrizioni.
  - Tag di durata e XP stilizzati come badge di sala trading.

---

## 🛡️ Garanzie di Integrità e Compatibilità
- **Nessuna perdita di dati o contenuti:** I 12 moduli, i quiz, le formule e i generatori PDF rimangono identici.
- **Nessuna dipendenza esterna:** Usiamo solo TailwindCSS, Lucide Icons e la Web Audio API già presenti.
- **Test di compilazione:** TypeScript `tsc --noEmit` e suite di test automatizzata.
