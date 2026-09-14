import React, { useState, useEffect } from 'react';
import { HTB_ACADEMY_MODULES, AcademyModule } from '../../constants/htbAcademyCurriculum';
import { AcademySimulators } from '../academy/components/AcademySimulators';
import { generateModuleHandbookPdf } from '../../services/academyPdfGenerator';
import {
  captureCampaignAttribution,
  trackLandingPageView,
  trackLeadGenerated,
  trackDemoAccountPrompt,
} from '../../services/marketingTracker';
import { triggerHaptic } from '../../utils/haptics';
import { LegalPolicyModal } from '../../components/common/LegalPolicyModal';
import {
  Shield,
  FileDown,
  Play,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Mail,
  User,
} from 'lucide-react';

interface GoogleAdsLandingPageProps {
  initialTopic?: string | null;
  onNavigateToTrading: (symbol?: string) => void;
  onNavigateToAcademy: (moduleId?: string) => void;
  onNavigateToHome?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const GoogleAdsLandingPage: React.FC<GoogleAdsLandingPageProps> = ({
  initialTopic,
  onNavigateToTrading,
  onNavigateToAcademy,
  onNavigateToHome,
}) => {
  // Capture UTM parameters on mount
  useEffect(() => {
    const attribution = captureCampaignAttribution();
    trackLandingPageView(initialTopic || 'masterclass', attribution.utm_campaign);
  }, [initialTopic]);

  // Resolve target module based on initialTopic (or fallback to MOD-07)
  const resolveTargetModule = (topic?: string | null): AcademyModule => {
    if (!topic) return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-07') || HTB_ACADEMY_MODULES[0];

    const clean = topic.toLowerCase().trim();
    if (clean.includes('mod-')) {
      const match = HTB_ACADEMY_MODULES.find((m) => m.id.toLowerCase() === clean);
      if (match) return match;
    }

    if (clean.includes('leverage') || clean.includes('leva') || clean.includes('liquidation')) {
      return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-07') || HTB_ACADEMY_MODULES[0];
    }
    if (clean.includes('risk') || clean.includes('size') || clean.includes('position')) {
      return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-08') || HTB_ACADEMY_MODULES[0];
    }
    if (clean.includes('spread') || clean.includes('orderbook') || clean.includes('bid')) {
      return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-02') || HTB_ACADEMY_MODULES[0];
    }
    if (clean.includes('pip') || clean.includes('lot') || clean.includes('tick')) {
      return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-03') || HTB_ACADEMY_MODULES[0];
    }
    if (clean.includes('expectancy') || clean.includes('reward') || clean.includes('ratio')) {
      return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-09') || HTB_ACADEMY_MODULES[0];
    }
    if (clean.includes('drawdown') || clean.includes('ruin') || clean.includes('recovery')) {
      return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-10') || HTB_ACADEMY_MODULES[0];
    }

    return HTB_ACADEMY_MODULES.find((m) => m.id === 'MOD-07') || HTB_ACADEMY_MODULES[0];
  };

  const [activeModule, setActiveModule] = useState<AcademyModule>(() => resolveTargetModule(initialTopic));
  const [studentName, setStudentName] = useState<string>(() => localStorage.getItem('apex_lead_name') || '');
  const [studentEmail, setStudentEmail] = useState<string>(() => localStorage.getItem('apex_lead_email') || '');
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'disclaimer' | 'terms' | 'privacy' | 'methodology' | null>(null);

  // Dynamic Headline Copy Map
  const getDynamicHeadline = () => {
    switch (activeModule.id) {
      case 'MOD-07':
        return {
          eyebrow: '⚡ SIMULATORE LEVA & MARGIN CALL',
          h1: 'Calcolo della Leva Finanziaria e Distanza di Liquidazione',
          subtitle:
            'Comprendi la matematica del margine istituzionale, simula la soglia di liquidazione in tempo reale e scarica la dispensa didattica ufficiale in PDF senza rischiare capitale.',
        };
      case 'MOD-08':
        return {
          eyebrow: '🛡️ RISK MANAGEMENT & POSITION SIZING',
          h1: "La Regola dell'1% di Rischio e il Dimensionamento delle Size",
          subtitle:
            'Come i Desk quantitativi calcolano la size massima per trade in base alla distanza dello Stop Loss: metti in sicurezza il capitale con formule matematiche verificate.',
        };
      case 'MOD-02':
        return {
          eyebrow: '📊 MICROSTRUTTURA & BOOK ORDINI',
          h1: 'Meccanica del Bid, Ask e Costo Implicito dello Spread',
          subtitle:
            'Scopri come si forma il prezzo di scambio, analizza lo spread in tempo reale e comprendi l’impatto dei costi impliciti su ogni esecuzione a mercato.',
        };
      case 'MOD-03':
        return {
          eyebrow: '📈 DIMENSIONAMENTO DEI MOVIMENTI',
          h1: 'Valore del Pip e Calcolo Dinamico dei Lotti Operativi',
          subtitle:
            'Micro (0.01), Mini (0.10) e Standard (1.00): calcola all’istante il controvalore monetario esatto di ogni variazione di prezzo prima di entrare a mercato.',
        };
      case 'MOD-09':
        return {
          eyebrow: '🎯 FORMULA QUANTITATIVA',
          h1: 'Risk:Reward Ratio e Aspettativa Matematica Positiva',
          subtitle:
            'Perché anche con un win rate del 40% è possibile avere un edge positivo: simula l’Expected Value e trasforma il trading in una disciplina statistica.',
        };
      case 'MOD-10':
        return {
          eyebrow: '👑 CAPITAL PRESERVATION',
          h1: 'Geometria del Drawdown e Rendimento di Pareggio',
          subtitle:
            'L’asimmetria delle perdite finanziarie: scopri perché recuperare il -50% richiede il +100% e come i trader professionisti preservano il portafoglio.',
        };
      default:
        return {
          eyebrow: '🔥 APEX QUANT MASTERCLASS • ACCESSO DIDATTICO',
          h1: 'Diventa un Operatore Quant: Microstruttura, Rischio & Simulatore Live',
          subtitle:
            'Il percorso formativo istituzionale a 12 moduli con simulatori interattivi, terminale didattico sandbox con $10,000 demo gratuiti e Diploma Ufficiale Certificato.',
        };
    }
  };

  const copy = getDynamicHeadline();

  const handleDownloadPdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) return;

    try {
      triggerHaptic('success');
      setIsPdfDownloading(true);

      const name = studentName.trim() || 'Studente Quant';
      const email = studentEmail.trim();

      // Persist in localStorage
      localStorage.setItem('apex_lead_name', name);
      localStorage.setItem('apex_lead_email', email);

      // Track high-value lead macro-conversion for Google Ads
      trackLeadGenerated({
        email,
        name,
        moduleId: activeModule.id,
        moduleTitle: activeModule.title,
        source: 'google_ads_dedicated_lp',
      });

      // Generate vector PDF
      generateModuleHandbookPdf(activeModule, name);
      setDownloadSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Testing Controls Bar (Allows switching topics or returning to Home) */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-b border-cyan-500/30 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          {onNavigateToHome && (
            <button
              type="button"
              onClick={onNavigateToHome}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>← Torna al Portale Principale</span>
            </button>
          )}
          <span className="text-cyan-400 font-bold hidden sm:inline px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
            🎯 LANDING PAGE DEDICATA GOOGLE ADS (/lp)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-slate-400 hidden lg:inline font-bold">Varianti Annuncio:</span>
          {[
            { id: 'MOD-07', label: 'Leva & Margin Call' },
            { id: 'MOD-08', label: 'Rischio 1%' },
            { id: 'MOD-02', label: 'Spread & Book' },
            { id: 'MOD-03', label: 'Valore Pip' },
            { id: 'MOD-09', label: 'Expected Value' },
            { id: 'MOD-10', label: 'Drawdown' },
          ].map((item) => {
            const isCurrent = activeModule.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  const m = HTB_ACADEMY_MODULES.find((mod) => mod.id === item.id);
                  if (m) setActiveModule(m);
                }}
                className={`px-2.5 py-0.5 rounded-md border transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-sm'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. NO-LEAKAGE MINIMAL INSTITUTIONAL HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/20">
              A
            </div>
            <div>
              <span className="font-black tracking-tight text-base sm:text-lg text-white">
                APEX<span className="text-cyan-400">TRADER</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest border-l border-slate-700 pl-2">
                QUANT RESEARCH & EDTECH
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Actions: Trust Badge + Direct Demo Activation */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Sandbox Didattica • Rischio Zero</span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              trackDemoAccountPrompt('google_ads_lp_header');
              onNavigateToTrading('BTC/USD');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs font-mono transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Terminale Demo ($10,000)</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* ========================================================================= */}
        {/* 2. HERO SECTION WITH EMBEDDED LIVE SIMULATOR (ABOVE THE FOLD HOOK) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Focused Copy & Value Proposition */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black font-mono tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{copy.eyebrow}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {copy.h1}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {copy.subtitle}
            </p>

            {/* Quick Micro-Topics Switcher */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase block mb-2 font-mono">
                Sperimenta i Laboratori Matematici Live:
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {[
                  { id: 'MOD-07', label: 'Leva & Liquidazione' },
                  { id: 'MOD-08', label: 'Rischio 1%' },
                  { id: 'MOD-02', label: 'Spread & Book' },
                  { id: 'MOD-03', label: 'Valore Pip' },
                  { id: 'MOD-09', label: 'Expected Value' },
                ].map((item) => {
                  const isSelected = activeModule.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        const m = HTB_ACADEMY_MODULES.find((mod) => mod.id === item.id);
                        if (m) setActiveModule(m);
                      }}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Nessun versamento né denaro reale</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Calcolo WAP a doppia partita</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dispensa Formativa PDF Ufficiale</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Diploma Finale con Verifica SHA-256</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Interactive Simulator Hook */}
          <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                  {activeModule.id}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                  {activeModule.title}
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                LIVE INTERACTIVE LAB
              </span>
            </div>

            {/* Render the Exact Live Mathematical Simulator Widget */}
            <AcademySimulators moduleId={activeModule.id} />

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Formula Istituzionale Attiva</span>
              <button
                type="button"
                onClick={() => onNavigateToAcademy(activeModule.id)}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Approfondisci il modulo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DUAL HIGH-CONVERTING CONVERSION SECTION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Card A: Lead Magnet (Download Official PDF Handbook) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/40 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider font-mono block">
                  ACCESSO IMMEDIATO AL DOSSIER
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Scarica la Dispensa Formativa PDF
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ricevi la guida metodologica di <strong>{activeModule.title}</strong> in formato vettoriale PDF ad alta risoluzione: formule matematiche, schemi grafici e casi studio reali.
            </p>

            {downloadSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Dispensa PDF Generata con Successo!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Il file è stato scaricato sul tuo dispositivo. Ora puoi mettere in pratica i concetti operando sul terminale demo sandbox.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToTrading('BTC/USD')}
                  className="mt-2 w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Apri Terminale Demo Didattico</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleDownloadPdf} className="space-y-3 font-mono">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">Il tuo Nome (per intestazione documento):</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nome e Cognome..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold">La tua Email di Studio:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="nome@esempio.com..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPdfDownloading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isPdfDownloading ? 'Generazione PDF...' : 'SCARICA LA DISPENSA IN PDF (GRATIS)'}</span>
                </button>
                <span className="text-[10px] text-slate-500 text-center block">
                  🔒 Nessun dato ceduto a terzi. Solo materiale didattico ed educativo.
                </span>
              </form>
            )}
          </div>

          {/* Card B: Sandbox Demo Activation */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-emerald-500/40 shadow-2xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 fill-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider font-mono block">
                    ATTIVAZIONE TERMINALE DI TRADING
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Simulatore Sandbox ($10,000 Demo)
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Metti in pratica le nozioni teoriche direttamente sul book ordini in tempo reale. Ricevi un conto didattico precaricato con <strong>$10,000 virtuali</strong> per testare strategie di position sizing e stop loss a rischio zero.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Saldo Didattico Iniziale:</span>
                  <strong className="text-emerald-400">$10,000.00 USD (Virtuale)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Motore di Esecuzione:</span>
                  <strong className="text-white">WAP a Doppia Partita</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rischio di Capitale:</span>
                  <strong className="text-cyan-400">ZERO (100% Simulazione)</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  trackDemoAccountPrompt('google_ads_lp_sandbox_cta');
                  onNavigateToTrading('BTC/USD');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs font-mono transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>ATTIVA TERMINALE SANDBOX ORA</span>
              </button>
              <span className="text-[10px] text-slate-500 text-center block font-mono">
                Accesso immediato senza carta di credito o documentazione bancaria.
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. INSTITUTIONAL QUALITY & SYLLABUS OVERVIEW */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-cyan-400 uppercase font-mono tracking-widest">
              PERCORSO FORMATIVO ACCREDITATO
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Il Programma Didattico di 12 Moduli Istituzionali
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Dalla microstruttura del book ordini fino alla geometria asimmetrica del drawdown e alla psicologia del rischio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            {HTB_ACADEMY_MODULES.slice(0, 8).map((mod) => (
              <div
                key={mod.id}
                onClick={() => onNavigateToAcademy(mod.id)}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">{mod.id}</span>
                  <span className="text-[10px] text-amber-400">+{mod.xp} XP</span>
                </div>
                <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {mod.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                  {mod.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Official Diploma Preview Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-cyan-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white">
                  Diploma Ufficiale Certificato: Institutional Quant Master
                </h4>
                <p className="text-xs text-slate-300">
                  Rilasciato al completamento dei 12 laboratori con hash crittografico SHA-256 univoco.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToAcademy()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono transition-all shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
            >
              Vedi Tutti i 12 Moduli
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. STRICT GOOGLE FINANCIAL SERVICES POLICY COMPLIANCE FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs px-4 sm:px-8 py-8 mt-12 space-y-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Regulatory Risk Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] leading-relaxed text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
              <Shield className="w-4 h-4" />
              <span>DISCLAIMER ISTITUZIONALE & FINALITÀ DIDATTICHE ESCLUSIVE (SIMULATORE PAPER TRADING)</span>
            </div>
            <p>
              ApexTrader è una piattaforma didattica ed educativa appartenente alla categoria <strong>EdTech / Financial Simulation Software</strong>.
              Tutti i prezzi, i grafici, i saldi di conto (incluso il credito didattico di $10,000 demo), i margini e le operazioni simulate avvengono esclusivamente in un ambiente sandbox privo di valore monetario reale.
            </p>
            <p>
              ApexTrader non opera come broker, istituto di credito, exchange regolamentato né fornitore di servizi di investimento o consulenza finanziaria. Nessun capitale reale viene raccolto, custodito o impiegato. I contenuti formativi, i calcolatori e le challenge hanno mero scopo accademico e illustrativo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-[11px]">
            <div>
              <span>© {new Date().getFullYear()} ApexTrader Technologies. Tutti i diritti riservati.</span>
              <span className="block text-slate-500">Supporto Tecnico & Didattico: <strong className="text-slate-400 font-mono">support@apextrader.demo</strong></span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <button
                type="button"
                onClick={() => setLegalModalTab('disclaimer')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Informativa Rischio
              </button>
              <button
                type="button"
                onClick={() => setLegalModalTab('privacy')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Privacy GDPR
              </button>
              <button
                type="button"
                onClick={() => setLegalModalTab('terms')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Termini di Servizio
              </button>
              <button
                type="button"
                onClick={() => setLegalModalTab('methodology')}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Metodologia WAP
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Tabbed Legal Disclaimer Modal */}
      {legalModalTab && (
        <LegalPolicyModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}
    </div>
  );
};
