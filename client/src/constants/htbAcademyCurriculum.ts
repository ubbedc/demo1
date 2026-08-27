export interface AcademyModule {
  id: string;
  tier: 0 | 1 | 2 | 3;
  tierName: string;
  title: string;
  duration: string;
  difficulty: 'Very Easy' | 'Easy' | 'Medium' | 'Hard';
  xp: number;
  icon: string;
  summary: string;
  theory: {
    heading: string;
    paragraphs: string[];
    formulaBox?: {
      title: string;
      formula: string;
      explanation: string;
    };
    exampleBox: {
      scenario: string;
      calculation: string;
      result: string;
    };
    keyTakeaways: string[];
  };
  targetLab: {
    symbol: string;
    actionName: string;
    instructions: string;
  };
  challenge: {
    question: string;
    hint: string;
    correctAnswer: string;
    acceptableAnswers: string[];
    explanationOnSuccess: string;
  };
}

export const HTB_ACADEMY_MODULES: AcademyModule[] = [
  // ==========================================
  // TIER 0: MARKET MICROSTRUCTURE & LIQUIDITY
  // ==========================================
  {
    id: 'MOD-01',
    tier: 0,
    tierName: 'Tier 0 — Fondamenti & Microstruttura',
    title: 'The Engine of Capital: Prezzo vs Valore Intrinseco',
    duration: '10 min',
    difficulty: 'Very Easy',
    xp: 60,
    icon: '🏛️',
    summary: 'Scopri perché esistono i mercati finanziari, come le aziende raccolgono capitale e la distinzione fondamentale tra quotazione di mercato e valore reale.',
    theory: {
      heading: 'I Mercati Finanziari: Il Ponte tra Imprese e Investitori',
      paragraphs: [
        'I mercati finanziari non sono semplici "numeri che salgono e scendono". Sono l’infrastruttura con cui le aziende innovative raccolgono capitali per costruire fabbriche, sviluppare tecnologie ed espandere le proprie attività.',
        'Quando acquisti un’azione o un asset, stai acquistando un titolo di credito o una frazione di proprietà economica. Tuttavia, il mercato è guidato da una dinamica chiave: il Prezzo è ciò che paghi in questo istante, ma il Valore è ciò che l’attività sottostante genera nel tempo.',
        'La capitalizzazione di mercato (Market Cap) rappresenta il valore complessivo attribuito dal mercato a un asset e si calcola moltiplicando il prezzo attuale per il numero totale di unità emesse.',
      ],
      formulaBox: {
        title: 'Formula della Capitalizzazione di Mercato (Market Cap)',
        formula: 'Market Cap = Prezzo Unitario × Unità Totali Circolanti',
        explanation: 'Esprime il valore totale di mercato dell’asset in un dato momento.',
      },
      exampleBox: {
        scenario: 'Una società fintech emette 5.000.000 di azioni. Il prezzo sul mercato sale da 20$ a 25$.',
        calculation: 'Market Cap Iniziale = 5.000.000 × 20$ = 100.000.000$\nNuovo Market Cap = 5.000.000 × 25$ = 125.000.000$',
        result: 'La capitalizzazione complessiva è aumentata di +25.000.000$ (+25%).',
      },
      keyTakeaways: [
        'Il prezzo di mercato oscilla per domanda e offerta a breve termine, ma il valore reale dipende dai fondamentali.',
        'Prezzo ≠ Valore: non confondere una fluttuazione momentanea con la solidità di un asset.',
        'La Market Cap è la metrica sovrana per comprendere le reali dimensioni di un mercato.',
      ],
    },
    targetLab: {
      symbol: 'BTC/USD',
      actionName: 'Apri Grafico Bitcoin nel Terminale',
      instructions: 'Esamina il prezzo live di Bitcoin sul terminale e osserva come ogni tick riflette la domanda istituzionale.',
    },
    challenge: {
      question: 'Se un’azienda ha 2.000.000 di azioni circolanti e il prezzo di mercato è di 15$ per azione, qual è la sua Capitalizzazione di Mercato in milioni di dollari (inserisci solo il numero)?',
      hint: 'Moltiplica 2.000.000 per 15.',
      correctAnswer: '30',
      acceptableAnswers: ['30', '30000000', '30 milioni', '$30M', '30M'],
      explanationOnSuccess: 'Eccellente! Market Cap = 2M × 15$ = 30 Milioni di Dollari. Flag catturata!',
    },
  },

  {
    id: 'MOD-02',
    tier: 0,
    tierName: 'Tier 0 — Fondamenti & Microstruttura',
    title: 'The Order Book Matrix: Bid, Ask, Spread & Profondità',
    duration: '12 min',
    difficulty: 'Easy',
    xp: 70,
    icon: '📊',
    summary: 'Comprendi la microstruttura del mercato: come interagiscono compratori e venditori nel libro degli ordini (Order Book) e cos’è lo Spread.',
    theory: {
      heading: 'Il Cuore dell’Exchange: L’Order Book e lo Spread',
      paragraphs: [
        'Dietro a ogni grafico di trading opera un Matching Engine collegato a un Order Book (Libro degli Ordini). L’Order Book è composto da due colonne contrapposte:',
        '1. BID (Denaro): Il miglior prezzo al quale i compratori sono disposti ad acquistare.\n2. ASK (Lettera): Il miglior prezzo al quale i venditori sono disposti a cedere il proprio asset.',
        'La differenza tra il miglior Ask e il miglior Bid si chiama SPREAD. Lo spread rappresenta il costo implicito di transazione e la misura immediata della liquidità del mercato.',
      ],
      formulaBox: {
        title: 'Formula dello Spread di Mercato',
        formula: 'Spread = Prezzo Ask - Prezzo Bid',
        explanation: 'Minore è lo spread, maggiore è la liquidità e l’efficienza dell’asset negoziato.',
      },
      exampleBox: {
        scenario: 'Su EUR/USD, il prezzo Ask è 1.0852 e il prezzo Bid è 1.0850.',
        calculation: 'Spread = 1.0852 - 1.0850 = 0.0002 (ovvero 2 pips)',
        result: 'Se compri e vendi istantaneamente a mercato, il costo di negoziazione è di 2 pips.',
      },
      keyTakeaways: [
        'Compri sempre all’Ask (più alto) e vendi sempre al Bid (più basso).',
        'Nei mercati altamente liquidi (come EUR/USD o Bitcoin), lo spread è infinitesimale.',
        'Nei mercati illiquidi, uno spread elevato aumenta il costo di ingresso per il trader.',
      ],
    },
    targetLab: {
      symbol: 'EUR/USD',
      actionName: 'Verifica Spread sul Forex Desk',
      instructions: 'Apri il grafico EUR/USD e controlla la colonna Bid/Ask in tempo reale sul terminale.',
    },
    challenge: {
      question: 'Se il prezzo Ask di una materia prima è $2.450,50 e il prezzo Bid è $2.448,50, a quanti dollari ammonta lo Spread esatto (inserisci solo il numero)?',
      hint: 'Sottrai il Bid dall’Ask: 2450.50 - 2448.50.',
      correctAnswer: '2',
      acceptableAnswers: ['2', '2.0', '2.00', '$2', '2$'],
      explanationOnSuccess: 'Corretto! Lo spread è di 2,00$ esatti. Ottimo lavoro con l’analisi del book!',
    },
  },

  {
    id: 'MOD-03',
    tier: 0,
    tierName: 'Tier 0 — Fondamenti & Microstruttura',
    title: 'Asset Classes Taxonomy: Forex, Crypto, Oro & Indici',
    duration: '14 min',
    difficulty: 'Easy',
    xp: 70,
    icon: '🪙',
    summary: 'Guida completa alle 5 grandi classi di strumenti: valute, materie prime, indici globali, criptovalute e azioni.',
    theory: {
      heading: 'Caratteristiche e Volatilità delle Grandi Classi Finanziarie',
      paragraphs: [
        'Un operatore professionista non si limita a un solo mercato, ma sa sfruttare la correlazione tra diverse classi di asset:',
        '• Forex (Valute): Il mercato più liquido al mondo (6.000 miliardi $/giorno). Si opera su coppie relative (es. EUR contro USD).\n• Materie Prime (Commodities): Oro (XAU/USD) e Petrolio (WTI). L’oro è il bene rifugio per eccellenza durante le turbolenze inflattive.\n• Indici (Indices): S&P 500 e Nasdaq 100. Rappresentano panieri diversificati delle più grandi aziende mondiali.\n• Crypto: Asset digitali a 24/7 ad altissima volatilità e innovazione tecnologica.',
      ],
      formulaBox: {
        title: 'Definizione di Pip nel Forex',
        formula: '1 Pip = 0.0001 di variazione sul tasso di cambio standard',
        explanation: 'Sulle coppie con lo Yen (JPY), 1 Pip corrisponde a 0.01.',
      },
      exampleBox: {
        scenario: 'Compri 1 lotto standard (100.000€) su EUR/USD a 1.0800. Il prezzo sale a 1.0850 (+50 pips).',
        calculation: 'Valore Pip = 10$ per pip su 1 lotto standard\nProfitto = 50 pips × 10$ = +500$',
        result: 'Guadagno netto di +500$ grazie a un movimento di mezzo centesimo di dollaro.',
      },
      keyTakeaways: [
        'Ogni asset ha una sua personalità, orari di negoziazione e livello di volatilità.',
        'L’Oro (XAU) tende a muoversi in direzione opposta rispetto al dollaro USA.',
        'La diversificazione tra asset decorrelati protegge il capitale nei momenti di crisi.',
      ],
    },
    targetLab: {
      symbol: 'XAU/USD',
      actionName: 'Esamina il Grafico dell’Oro',
      instructions: 'Seleziona Gold (XAU/USD) nel terminale e osserva la formazione delle candele a 15 minuti.',
    },
    challenge: {
      question: 'Se il tasso di cambio EUR/USD passa da 1.0900 a 1.0945, di quanti Pips è salito il prezzo (inserisci solo il numero)?',
      hint: '1.0945 - 1.0900 = 0.0045, che equivale a quante unità base di 0.0001?',
      correctAnswer: '45',
      acceptableAnswers: ['45', '45 pips', '+45', '45.0'],
      explanationOnSuccess: 'Perfetto! Il movimento è di +45 pips. Hai completato con successo il Tier 0!',
    },
  },

  // ==========================================
  // TIER 1: EXECUTION MECHANICS & LEDGER
  // ==========================================
  {
    id: 'MOD-04',
    tier: 1,
    tierName: 'Tier 1 — Meccanica Operativa & Ordini',
    title: 'Anatomy of an Execution: Ordine ➔ Fill ➔ Posizione',
    duration: '14 min',
    difficulty: 'Easy',
    xp: 75,
    icon: '⚡',
    summary: 'Comprendi la distinzione cruciale tra inviare un Ordine, ottenere l’Esecuzione (Fill) e detenere una Posizione aperta a mercato.',
    theory: {
      heading: 'La Catena di Esecuzione di un Trade Istituzionale',
      paragraphs: [
        'Uno degli errori più comuni è confondere l’ordine con la posizione. In finanza, il ciclo operativo segue una sequenza rigorosa:',
        '1. ORDINE (Intent): La richiesta trasmessa al broker (es. "Voglio comprare 0.5 BTC al prezzo corrente").\n2. ESECUZIONE / FILL: Il Matching Engine abbina la tua richiesta con i venditori nel book e chiude il contratto.\n3. POSIZIONE (Exposure): Solo dopo il fill sei esposto al mercato. La posizione rimane attiva finché non viene liquidata.',
        'Gli ordini possono essere "Market" (eseguiti istantaneamente al miglior prezzo disponibile) o "Limit" (eseguiti solo al prezzo desiderato o migliore).',
      ],
      formulaBox: {
        title: 'Formula del Controvalore Notionale (Notional Value)',
        formula: 'Controvalore Notionale = Quantità Eseguita × Prezzo di Esecuzione',
        explanation: 'Rappresenta l’esposizione lorda in dollari della posizione a mercato.',
      },
      exampleBox: {
        scenario: 'Piazzi un ordine BUY di 2.0 ETH a 3.500$ a mercato.',
        calculation: 'Notional Value = 2.0 × 3.500$ = 7.000$',
        result: 'Viene aperta una posizione LONG su Ethereum per un valore complessivo di 7.000$.',
      },
      keyTakeaways: [
        'Un ordine pendente (Limit) NON genera profitti o perdite finché non viene eseguito (Filled).',
        'La posizione aperta è soggetta alle fluttuazioni di mercato secondo dopo secondo.',
        'La chiusura della posizione trasforma il P/L non realizzato in saldo di cassa reale.',
      ],
    },
    targetLab: {
      symbol: 'ETH/USD',
      actionName: 'Piazza un Ordine Limit su Ethereum',
      instructions: 'Apri il terminale, seleziona ETH/USD e prova a compilare la casella di acquisto.',
    },
    challenge: {
      question: 'Se invii un ordine BUY per 0.5 Bitcoin al prezzo eseguito di $70.000, qual è il Controvalore Notionale in dollari della posizione generata (inserisci solo il numero)?',
      hint: '0.5 × 70.000 = ?',
      correctAnswer: '35000',
      acceptableAnswers: ['35000', '35.000', '$35000', '$35.000', '35000$'],
      explanationOnSuccess: 'Esatto! Il controvalore notionale è di 35.000$. Flag validata!',
    },
  },

  {
    id: 'MOD-05',
    tier: 1,
    tierName: 'Tier 1 — Meccanica Operativa & Ordini',
    title: 'Bidirectional Mechanics: Long vs Short Selling',
    duration: '15 min',
    difficulty: 'Medium',
    xp: 80,
    icon: '🔄',
    summary: 'Come guadagnare sia quando i mercati salgono (Long) sia quando scendono (Short), e la meccanica del prestito titoli.',
    theory: {
      heading: 'Operatività Bidirezionale: La Forza dello Short Selling',
      paragraphs: [
        'Nel trading professionistico non si aspetta passivamente che i mercati salgano. È possibile trarre profitto anche dai ribassi:',
        '• LONG (Acquisto): Compri a un prezzo basso con l’obiettivo di rivendere a un prezzo più alto.\n• SHORT (Vendita allo Scoperto): Vendi un asset che non possiedi (preso a prestito dall’infrastruttura di liquidità) con l’obiettivo di ricomprarlo a un prezzo inferiore.',
        'La formula del profitto per uno Short è invertita rispetto al Long: guadagni quando il prezzo finale è inferiore al prezzo di ingresso.',
      ],
      formulaBox: {
        title: 'Formule di Profit & Loss (P/L)',
        formula: 'P/L Long = (Prezzo Chiusura - Prezzo Ingresso) × Quantità\nP/L Short = (Prezzo Ingresso - Prezzo Chiusura) × Quantità',
        explanation: 'Nello Short, più il prezzo crolla, maggiore è il profitto realizzato.',
      },
      exampleBox: {
        scenario: 'Apri una posizione SHORT di 10 once di Oro a 2.400$. Il prezzo dell’oro scende a 2.350$ e chiudi la posizione.',
        calculation: 'P/L Short = (2.400$ - 2.350$) × 10 = 50$ × 10',
        result: 'Hai realizzato un profitto netto di +500$ su un mercato in caduta.',
      },
      keyTakeaways: [
        'Lo Short Selling offre liquidità al mercato e permette di coprire (hedging) i rischi.',
        'Attenzione al rischio asimmetrico: un prezzo può scendere al massimo fino a zero, ma teoricamente può salire all’infinito.',
        'Usa sempre lo Stop Loss sia sulle posizioni Long che sulle posizioni Short.',
      ],
    },
    targetLab: {
      symbol: 'NDX/USD',
      actionName: 'Testa uno Short sull’Indice Nasdaq',
      instructions: 'Apri il terminale, seleziona NDX/USD e osserva il pulsante rosso SELL Short.',
    },
    challenge: {
      question: 'Apri uno SHORT su 5 contratti di un indice al prezzo di 18.000$. Chiudi la posizione a 17.800$. A quanti dollari ammonta il tuo Profitto Netto (inserisci solo il numero)?',
      hint: '(18.000 - 17.800) × 5 = 200 × 5.',
      correctAnswer: '1000',
      acceptableAnswers: ['1000', '1.000', '+1000', '$1000', '1000$'],
      explanationOnSuccess: 'Perfetto! (18.000 - 17.800) × 5 = +1.000$ di profitto realizzato. Ottimo trade!',
    },
  },

  {
    id: 'MOD-06',
    tier: 1,
    tierName: 'Tier 1 — Meccanica Operativa & Ordini',
    title: 'Double-Entry Accounting: Cash Balance, Equity & WAP',
    duration: '16 min',
    difficulty: 'Medium',
    xp: 85,
    icon: '📑',
    summary: 'Il modello contabile istituzionale: Saldo di Cassa, Margine, Equity e Prezzo Medio Ponderato (Weighted Average Price).',
    theory: {
      heading: 'L’Equazione Fondamentale del Conto di Trading',
      paragraphs: [
        'Una piattaforma di trading opera secondo il principio contabile bancario della doppia partita:',
        '1. CASH BALANCE: Il capitale liquido depositato e non vincolato in operazioni chiuse.\n2. UNREALIZED P/L: La somma algebrica dei profitti e delle perdite di tutte le posizioni attualmente aperte.\n3. EQUITY (Patrimonio Netto): Il valore reale complessivo del conto se chiudessi tutte le posizioni in questo istante.',
        'Inoltre, se acquisti lo stesso asset a prezzi diversi in momenti successivi, il tuo prezzo di carico si calcola tramite il Prezzo Medio Ponderato (WAP).',
      ],
      formulaBox: {
        title: 'Equazione Sovrana dell’Equity & WAP',
        formula: 'Equity = Cash Balance + Unrealized P/L\nWAP = (Q1 × P1 + Q2 × P2) / (Q1 + Q2)',
        explanation: 'L’Equity è il termometro veritiero della salute patrimoniale del trader.',
      },
      exampleBox: {
        scenario: 'Hai 10.000$ di Cash Balance. Hai 2 posizioni aperte: una in profitto di +1.200$ e una in perdita di -400$.',
        calculation: 'Unrealized P/L = +1.200$ - 400$ = +800$\nEquity = 10.000$ + 800$',
        result: 'La tua Equity reale è di 10.800$.',
      },
      keyTakeaways: [
        'Non guardare solo il saldo di cassa: l’Equity è ciò che possiedi realmente.',
        'Se compri quote aggiuntive di un asset che sale (Pyramiding), il WAP si alza progressivamente.',
        'Se l’Equity scende al di sotto del margine richiesto, scatta la Margin Call.',
      ],
    },
    targetLab: {
      symbol: 'SOL/USD',
      actionName: 'Verifica Saldo ed Equity nel Portafoglio',
      instructions: 'Guarda la card del portafoglio in cima alla schermata per vedere la scomposizione live tra Saldo, Margine ed Equity.',
    },
    challenge: {
      question: 'Un trader ha un Cash Balance di $15.000 e posizioni aperte con un Unrealized P/L totale di -$2.500. A quanto ammonta la sua Equity attuale in dollari (inserisci solo il numero)?',
      hint: '15.000 + (-2.500) = ?',
      correctAnswer: '12500',
      acceptableAnswers: ['12500', '12.500', '$12500', '$12.500', '12500$'],
      explanationOnSuccess: 'Esatto! 15.000$ - 2.500$ = 12.500$ di Equity. Tier 1 completato con successo!',
    },
  },

  // ==========================================
  // TIER 2: QUANTITATIVE RISK & LEVERAGE
  // ==========================================
  {
    id: 'MOD-07',
    tier: 2,
    tierName: 'Tier 2 — Matematica del Rischio & Leva',
    title: 'The Double-Edged Blade: Leva, Margine & Liquidazione',
    duration: '18 min',
    difficulty: 'Medium',
    xp: 90,
    icon: '⚡',
    summary: 'Come funziona la Leva Finanziaria, il calcolo del Margine Richiesto e come prevenire la liquidazione forzata del conto.',
    theory: {
      heading: 'La Leva Finanziaria: Amplificatore di Risultati e Rischi',
      paragraphs: [
        'La leva finanziaria permette di controllare una posizione di valore superiore rispetto al capitale depositato:',
        '• Con Leva 1:10, depositi 1.000$ di margine e controlli 10.000$ di controvalore notionale.\n• Se il mercato si muove del +5% a tuo favore, guadagni 500$ (che equivale al +50% sul tuo margine depositato).\n• MA se il mercato si muove del -5% contro di te, perdi 500$ (il -50% del tuo capitale).',
        'Se le perdite consumano tutto il margine disponibile, il broker è costretto a chiudere d’ufficio la posizione (Liquidation) per proteggere il capitale.',
      ],
      formulaBox: {
        title: 'Formula del Margine Richiesto & Distanza di Liquidazione',
        formula: 'Margine Richiesto = Controvalore Notionale / Rapporto di Leva\n% Movimento per Liquidazione ≈ 100 / Leva',
        explanation: 'Con leva 1:20, basta un movimento avverso del 5% per azzerare il margine depositato.',
      },
      exampleBox: {
        scenario: 'Apri una posizione da 50.000$ con Leva 1:20.',
        calculation: 'Margine Impegnato = 50.000$ / 20 = 2.500$\nSe l’asset perde il 5%: 50.000$ × 5% = 2.500$',
        result: 'Hai perso l’intero margine di 2.500$ con una discesa di appena il 5% del sottostante.',
      },
      keyTakeaways: [
        'La leva non rende un trader più bravo: amplifica solo la velocità con cui vince o perde.',
        'I fondi istituzionali usano leve basse (1:2 o 1:5) per evitare shock di volatilità improvvisi.',
        'Lo Stop Loss è obbligatorio quando si opera con strumenti a leva.',
      ],
    },
    targetLab: {
      symbol: 'BTC/USD',
      actionName: 'Simula Ordine con Leva nel Desk',
      instructions: 'Accedi al pannello ordini e osserva come varia il margine richiesto al variare della taglia del trade.',
    },
    challenge: {
      question: 'Se utilizzi una Leva 1:10 su una posizione dal controvalore di $20.000, a quanti dollari ammonta il Margine Richiesto da impegnare (inserisci solo il numero)?',
      hint: '20.000 / 10 = ?',
      correctAnswer: '2000',
      acceptableAnswers: ['2000', '2.000', '$2000', '$2.000', '2000$'],
      explanationOnSuccess: 'Corretto! Margine = 20.000$ / 10 = 2.000$. Flag catturata con precisione!',
    },
  },

  {
    id: 'MOD-08',
    tier: 2,
    tierName: 'Tier 2 — Matematica del Rischio & Leva',
    title: 'Institutional Position Sizing: La Regola dell’1% di Rischio',
    duration: '18 min',
    difficulty: 'Hard',
    xp: 95,
    icon: '🎯',
    summary: 'La formula matematica utilizzata dai Risk Manager di Wall Street per calcolare la dimensione esatta dei contratti prima di entrare a mercato.',
    theory: {
      heading: 'Position Sizing: Il Segreto della Sopravvivenza Finanziaria',
      paragraphs: [
        'I trader dilettanti decidono prima "quanti lotti comprare" e poi sperano che il prezzo salga. I trader istituzionali fanno l’esatto opposto:',
        '1. Definiscono prima il capitale massimo che sono disposti a perdere (es. 1% del conto).\n2. Identificano sul grafico dove posizionare lo Stop Loss logico.\n3. Calcolano matematicamente la dimensione della posizione affinché, se lo Stop Loss viene colpito, la perdita sia ESATTAMENTE pari all’1%.',
      ],
      formulaBox: {
        title: 'Formula Universale del Position Sizing',
        formula: 'Taglia Posizione = (Capitale Conto × % Rischio Max) / Distanza Stop Loss in $',
        explanation: 'Garantisce che nessuna singola operazione possa mai intaccare seriamente il tuo patrimonio.',
      },
      exampleBox: {
        scenario: 'Conto di 50.000$, Rischio max 1% (= 500$). Vuoi comprare Bitcoin a 60.000$ con Stop Loss a 58.000$ (distanza = 2.000$).',
        calculation: 'Taglia = 500$ / 2.000$ = 0.25 BTC',
        result: 'Comprando 0.25 BTC, se il prezzo scende a 58.000$, perdi esattamente 500$ (l’1% esatto del tuo conto).',
      },
      keyTakeaways: [
        'Non rischiare mai più dell’1% o 2% del capitale totale su un singolo trade.',
        'La taglia della posizione deve adattarsi alla distanza dello Stop Loss, non viceversa.',
        'Rispettando questa regola, servirebbero 50 trade perdenti consecutivi per dimezzare il conto.',
      ],
    },
    targetLab: {
      symbol: 'AAPL/USD',
      actionName: 'Calcola Taglia su Azioni Apple',
      instructions: 'Apri il terminale su Apple e prova a simulare una posizione impostando il livello di Stop Loss.',
    },
    challenge: {
      question: 'Hai un conto di $20.000 e decidi di rischiare l’1% su un trade. A quanti dollari ammonta la tua Perdita Massima consentita su questa singola operazione (inserisci solo il numero)?',
      hint: 'Calcola l’1% di 20.000: (20.000 × 0.01).',
      correctAnswer: '200',
      acceptableAnswers: ['200', '200$', '$200', '200.0'],
      explanationOnSuccess: 'Esatto! 1% di 20.000$ = 200$. Questa è la regola fondamentale di gestione del rischio!',
    },
  },

  {
    id: 'MOD-09',
    tier: 2,
    tierName: 'Tier 2 — Matematica del Rischio & Leva',
    title: 'Mathematical Expectancy & Risk-to-Reward Ratio (R:R)',
    duration: '20 min',
    difficulty: 'Hard',
    xp: 95,
    icon: '📐',
    summary: 'Perché la percentuale di trade vincenti (Win Rate) non conta nulla senza un corretto rapporto Rischio/Rendimento.',
    theory: {
      heading: 'L’Aspettativa Matematica: Come Vincere con il 40% di Successo',
      paragraphs: [
        'Molti credono che per guadagnare serva avere ragione 8 o 9 volte su 10. Questa è un’illusione.',
        'Se quando vinci guadagni 100$, ma quando perdi ne perdi 500$, bastano due errori per cancellare dieci successi.',
        'Con un Rapporto Rischio/Rendimento (R:R) di 1:2 o 1:3 (rischi 100$ per guadagnarne 250$), puoi avere ragione solo 4 volte su 10 ed essere comunque largamente in profitto!',
      ],
      formulaBox: {
        title: 'Formula dell’Aspettativa Matematica (Expected Value)',
        formula: 'EV = (Win Rate × Guadagno Medio) - (Loss Rate × Perdita Media)',
        explanation: 'Se EV > 0, la strategia ha un vantaggio statistico matematico nel lungo periodo.',
      },
      exampleBox: {
        scenario: 'Esegui 10 trade. Rischi 100$ per guadagnarne 300$ (R:R 1:3). Vinci 4 trade e ne perdi 6 (Win Rate 40%).',
        calculation: 'Guadagni = 4 × 300$ = +1.200$\nPerdite = 6 × 100$ = -600$\nRisultato Netto = +1.200$ - 600$',
        result: 'Hai generato +600$ di profitto netto nonostante tu abbia sbagliato la maggior parte dei trade (6 su 10)!',
      },
      keyTakeaways: [
        'Punta sempre a trade con un rapporto Rischio/Rendimento minimo di 1:2 (meglio 1:3).',
        'Taglia rapidamente le perdite e lascia correre i profitti verso il Take Profit.',
        'Il trading è un gioco di probabilità e asimmetria statistica, non di previsioni magiche.',
      ],
    },
    targetLab: {
      symbol: 'NVDA/USD',
      actionName: 'Imposta Target 1:2 su NVIDIA',
      instructions: 'Seleziona NVIDIA nel terminale e osserva la distanza tra prezzo di ingresso, Stop Loss e Take Profit.',
    },
    challenge: {
      question: 'Se entri in un trade rischiando $150 di Stop Loss con un obiettivo di Take Profit a $450, qual è il tuo Rapporto Rischio/Rendimento R:R (rispondi nel formato 1:X, es. 1:2)?',
      hint: '450 / 150 = 3, quindi il rapporto è 1:3.',
      correctAnswer: '1:3',
      acceptableAnswers: ['1:3', '3', '1 a 3', '1/3', '3:1'],
      explanationOnSuccess: 'Eccellente! R:R di 1:3 esatto. Con questa asimmetria il modello statistico è a tuo favore!',
    },
  },

  {
    id: 'MOD-10',
    tier: 2,
    tierName: 'Tier 2 — Matematica del Rischio & Leva',
    title: 'Drawdown Geometry & Capital Preservation',
    duration: '16 min',
    difficulty: 'Medium',
    xp: 90,
    icon: '📉',
    summary: 'La trappola asimmetrica delle perdite: comprendere la geometria del Drawdown per non bruciare mai il conto.',
    theory: {
      heading: 'La Geometria Asimmetrica del Drawdown',
      paragraphs: [
        'Il Drawdown rappresenta la perdita percentuale dal picco massimo di capitale raggiunto dal conto.',
        'La matematica delle perdite è spietata a causa della natura non lineare delle percentuali:',
        '• Se perdi il 10%, ti serve un guadagno del +11.1% per recuperare.\n• Se perdi il 20%, ti serve un guadagno del +25%.\n• Se perdi il 50%, ti serve un guadagno del +100% (devi raddoppiare il capitale rimanente solo per tornare a zero)!\n• Se perdi il 90%, ti serve un mostruoso +900%.',
      ],
      formulaBox: {
        title: 'Formula del Rendimento di Recupero (Break-Even Recovery)',
        formula: 'Rendimento Necessario = [ Drawdown % / (100 - Drawdown %) ] × 100',
        explanation: 'Dimostra matematicamente perché proteggere il capitale è 10 volte più importante di cercare profitti folli.',
      },
      exampleBox: {
        scenario: 'Un conto passa da 10.000$ a 5.000$ (-50% di Drawdown per mancato uso dello Stop Loss).',
        calculation: 'Per tornare a 10.000$ partendo da 5.000$: (5.000$ / 5.000$) × 100 = +100%',
        result: 'Il trader deve compiere un’impresa titanica (+100%) solo per tornare al punto di partenza.',
      },
      keyTakeaways: [
        'Evita i grandi drawdown a tutti i costi: è molto più facile prevenire una perdita che recuperarla.',
        'Imposta un limite di perdita massima giornaliera (Daily Loss Limit del 3-5%).',
        'Chi impara a difendere il capitale ha già vinto il 90% della sfida nel trading.',
      ],
    },
    targetLab: {
      symbol: 'SPX/USD',
      actionName: 'Verifica Curva Patrimoniale',
      instructions: 'Esamina lo storico delle operazioni per monitorare la stabilità della tua curva di rendimento.',
    },
    challenge: {
      question: 'Se un conto subisce una perdita del 50% del proprio saldo, quale percentuale esatta di guadagno dovrà realizzare sul capitale rimasto solo per tornare in pareggio (inserisci solo il numero)?',
      hint: 'Se hai 100€ e scendi a 50€, quanto devi guadagnare su 50€ per tornare a 100€?',
      correctAnswer: '100',
      acceptableAnswers: ['100', '100%', '+100%', '100.0'],
      explanationOnSuccess: 'Esattamente +100%! La geometria del drawdown è la lezione più importante della finanza. Tier 2 superato!',
    },
  },

  // ==========================================
  // TIER 3: ADVANCED STRATEGY & MASTERY
  // ==========================================
  {
    id: 'MOD-11',
    tier: 3,
    tierName: 'Tier 3 — Strategia & Psicologia Istituzionale',
    title: 'Trader Psychology: Disinnescare FOMO, Avidità & Paura',
    duration: '20 min',
    difficulty: 'Hard',
    xp: 100,
    icon: '🧠',
    summary: 'La gestione dei 4 killer emotivi del trader: come operare con la disciplina ferrea di un algoritmo quantitativo.',
    theory: {
      heading: 'La Mente del Trader: Perché il 90% Perde per Motivi Emotivi',
      paragraphs: [
        'Il cervello umano si è evoluto per la sopravvivenza nella savana, non per gestire probabilità finanziarie astratte. Questo genera trappole cognitive devastanti:',
        '1. FOMO (Fear Of Missing Out): La paura di perdere l’occasione. Ti spinge a comprare ai massimi quando il prezzo è già esploso.\n2. REVENGE TRADING: Voler "recuperare subito" una perdita aprendo operazioni frettolose con taglie giganti.\n3. OVERTRADING: Aprire 30 operazioni al giorno per noia o adrenalina anziché aspettare i setup ad alta probabilità.\n4. DISPOSIZIONE (Sunk Cost): Chiudere i trade vincenti troppo presto per paura di perderli e tenere aperti i trade in perdita sperando che tornino a zero.',
      ],
      formulaBox: {
        title: 'Il Principio della Disciplina Istituzionale',
        formula: 'Successo = Regole Scritte + Esecuzione Meccanica - Emozioni Impulsive',
        explanation: 'I desk professionali non fanno trading per provare emozioni, ma per eseguire un processo statistico.',
      },
      exampleBox: {
        scenario: 'Un trader subisce una perdita di 100$. Sentendosi ferito nell’orgoglio, raddoppia la taglia e rientra a caso.',
        calculation: 'Revenge Trade = Perdita di altri 400$ ➔ Conto distrutto in 20 minuti',
        result: 'La reazione emotiva ha trasformato una normale perdita controllata in un disastro finanziario.',
      },
      keyTakeaways: [
        'Accetta le perdite come normali costi di gestione del business (come l’affitto per un negozio).',
        'Se senti rabbia, ansia o euforia, chiudi il computer per almeno 2 ore.',
        'Opera solo quando il tuo piano operativo ti dà un segnale chiaro e inequivocabile.',
      ],
    },
    targetLab: {
      symbol: 'BTC/USD',
      actionName: 'Esegui Trade a Mente Fredda',
      instructions: 'Piazza un ordine impostando Take Profit e Stop Loss, poi allontanati e lascia che il mercato lavori.',
    },
    challenge: {
      question: 'Come viene definito in gergo l’errore psicologico di raddoppiare la dimensione del trade subito dopo una perdita per cercare disperatamente di recuperare (in inglese)?',
      hint: 'Inizia con la parola Revenge...',
      correctAnswer: 'Revenge Trading',
      acceptableAnswers: ['Revenge Trading', 'revenge trading', 'Revenge', 'revenge'],
      explanationOnSuccess: 'Corretto! Il Revenge Trading è il nemico numero 1. Flag sbloccata!',
    },
  },

  {
    id: 'MOD-12',
    tier: 3,
    tierName: 'Tier 3 — Strategia & Psicologia Istituzionale',
    title: 'Institutional Trading Plan & Final Graduation Protocol',
    duration: '22 min',
    difficulty: 'Hard',
    xp: 120,
    icon: '👑',
    summary: 'La prova finale: redazione del Piano Operativo Istituzionale, validazione delle regole di Risk Desk e rilascio del Certificato Ufficiale.',
    theory: {
      heading: 'Il Protocollo Finale del Desk: Diventare un Operatore Completo',
      paragraphs: [
        'Congratulazioni per essere arrivato all’ultimo modulo dell’Academy. Ora possiedi la cassetta degli attrezzi teorica e pratica di un vero operatore finanziario:',
        'Hai compreso la Microstruttura (Tier 0), dominato la Meccanica Operativa e il Ledger (Tier 1), blindato il tuo Capitale con il Position Sizing (Tier 2) e compreso la Psicologia Istituzionale (Tier 3).',
        'Il tuo Piano di Trading deve contenere solo 4 regole inderogabili:',
        '1. Quali asset negozi (solo mercati liquidi con spread bassi).\n2. Rischio massimo per trade (1% dell’Equity).\n3. Rapporto Rischio/Rendimento minimo (1:2).\n4. Massimo drawdown giornaliero consentito (Stop operativo a -3%).',
      ],
      formulaBox: {
        title: 'Il Giuramento del Risk Manager',
        formula: 'Consistenza = Protezione del Capitale > Rendimento Percentuale',
        explanation: 'I soldi veri nei mercati non si fanno con colpi fortunati, ma con la ripetizione disciplinata di un vantaggio statistico.',
      },
      exampleBox: {
        scenario: 'Completamento di tutti i 12 Moduli Didattici della Masterclass.',
        calculation: '12 Moduli Completati = 1.000 XP Raggiunti ➔ Rilascio Grado "Institutional Quant Master"',
        result: 'Generazione del Diploma Ufficiale Istituzionale in PDF con sigillo crittografico SHA-256.',
      },
      keyTakeaways: [
        'Il trading è una professione seria basata su matematica, probabilità e gestione del rischio.',
        'La demo è la tua palestra: usala per consolidare le regole prima di qualsiasi altra cosa.',
        'Hai completato l’intero percorso formativo di Apex Academy!',
      ],
    },
    targetLab: {
      symbol: 'BTC/USD',
      actionName: 'Accedi al Terminale come Operatore Certificato',
      instructions: 'Apri il terminale per mettere in pratica le tue competenze acquisite su tutti i mercati disponibili.',
    },
    challenge: {
      question: 'Qual è il bene primario più importante che un trader istituzionale deve proteggere prima ancora di cercare il profitto?',
      hint: 'Inizia con la lettera C (il denaro depositato sul conto)...',
      correctAnswer: 'Capitale',
      acceptableAnswers: ['Capitale', 'il capitale', 'Il Capitale', 'Capitale di rischio', 'Capital'],
      explanationOnSuccess: 'CHAPEAU! La protezione del Capitale è la legge suprema. Hai completato TUTTI i 12 moduli della Masterclass!',
    },
  },
];
