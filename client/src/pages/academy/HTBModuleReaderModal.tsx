import React, { useState, useEffect } from 'react';
import { AcademyModule } from '../../constants/htbAcademyCurriculum';
import { generateModuleHandbookPdf } from '../../services/academyPdfGenerator';
import { triggerHaptic } from '../../utils/haptics';
import { AcademySimulators } from './components/AcademySimulators';
import { AcademyLeadCaptureModal } from './components/AcademyLeadCaptureModal';
import {
  trackModuleStarted,
  trackModuleCompleted,
  trackPdfDownload,
  trackDemoAccountPrompt,
} from '../../services/marketingTracker';
import {
  X,
  FileDown,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Layers,
  Award,
  BookOpen,
  Calculator,
  Target,
  ArrowRight,
} from 'lucide-react';

interface HTBModuleReaderModalProps {
  module: AcademyModule;
  isCompleted: boolean;
  onClose: () => void;
  onCompleteModule: (moduleId: string, xpEarned: number) => void;
  onSpawnLab: (symbol: string) => void;
  onNextModule?: () => void;
  onPrevModule?: () => void;
  userName?: string;
}

export const HTBModuleReaderModal: React.FC<HTBModuleReaderModalProps> = ({
  module,
  isCompleted,
  onClose,
  onCompleteModule,
  onSpawnLab,
  onNextModule,
  onPrevModule,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'math' | 'challenge'>('theory');
  const [flagInput, setFlagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(isCompleted ? module.challenge.explanationOnSuccess : null);
  const [showHint, setShowHint] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Reset reader state when module changes (e.g. Next / Prev module navigation)
  useEffect(() => {
    setActiveTab('theory');
    setFlagInput('');
    setErrorMsg(null);
    setSuccessMsg(isCompleted ? module.challenge.explanationOnSuccess : null);
    setShowHint(false);
  }, [module.id, isCompleted]);

  // Track module open as tutorial begin for Google Ads / GA4
  useEffect(() => {
    trackModuleStarted(module.id, module.title);
  }, [module.id]);

  const handleDownloadPdf = () => {
    const savedEmail = localStorage.getItem('apex_lead_email');
    if (!userName && !savedEmail) {
      setShowLeadModal(true);
      return;
    }
    executePdfDownload(userName || localStorage.getItem('apex_lead_name') || 'Studente Quant');
  };

  const executePdfDownload = (studentName: string) => {
    try {
      setIsPdfGenerating(true);
      trackPdfDownload(module.id, module.title);
      generateModuleHandbookPdf(module, studentName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Helper to normalize strings for rigorous quiz evaluation (no false positives)
  const normalizeAnswer = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[$€£]/g, '')
      .replace(/%/g, '')
      .replace(/\b(pips?|punti|pts|milioni|milione|usd|eur)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const evaluateAnswer = (userInput: string, acceptableAnswers: string[]): boolean => {
    const cleanUser = normalizeAnswer(userInput);
    if (!cleanUser) return false;

    // Direct normalized string match
    for (const ans of acceptableAnswers) {
      const cleanAns = normalizeAnswer(ans);
      if (cleanUser === cleanAns) return true;

      // Handle ratio patterns (e.g., '1:3' vs '1 a 3' vs '1/3')
      const ratioUser = cleanUser.replace(/\s*(:|a|\/)\s*/g, ':');
      const ratioAns = cleanAns.replace(/\s*(:|a|\/)\s*/g, ':');
      if (ratioUser === ratioAns) return true;
    }

    // Try numeric parsing (handling thousand separators and decimals)
    const parseNum = (str: string): number | null => {
      let s = str.trim();
      if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
        s = s.replace(/\./g, '');
      } else if (/^\d{1,3}(,\d{3})+$/.test(s)) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(/,/g, '.');
      }
      const n = parseFloat(s);
      return isNaN(n) ? null : n;
    };

    const userNum = parseNum(cleanUser);
    if (userNum !== null) {
      for (const ans of acceptableAnswers) {
        const ansNum = parseNum(normalizeAnswer(ans));
        if (ansNum !== null && Math.abs(userNum - ansNum) < 0.0001) {
          return true;
        }
      }
    }

    return false;
  };

  const handleSubmitFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    const isCorrect = evaluateAnswer(flagInput, module.challenge.acceptableAnswers);

    if (isCorrect) {
      triggerHaptic('success');
      setErrorMsg(null);
      setSuccessMsg(module.challenge.explanationOnSuccess);
      if (!isCompleted) {
        trackModuleCompleted(module.id, module.title, module.xp);
        onCompleteModule(module.id, module.xp);
      }
    } else {
      triggerHaptic('warning');
      setErrorMsg('Risposta non corretta. Rileggi attentamente il laboratorio o consulta il suggerimento!');
    }
  };

  const tabs = [
    { id: 'theory', label: '1. Teoria & Fondamenti', icon: BookOpen, tag: 'FONDAMENTI' },
    { id: 'math', label: '2. Formule & Simulatore', icon: Calculator, tag: 'SIMULATORE' },
    { id: 'challenge', label: '3. Challenge & Esame', icon: Target, tag: `+${module.xp} XP` },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black font-mono">
              {module.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-bold tracking-tight font-mono">{module.tierName}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-slate-400 font-mono">⏱️ {module.duration}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-amber-400 font-bold font-mono">+{module.xp} XP</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate max-w-[280px] sm:max-w-md">
                {module.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              title="Scarica Dispensa Formativa Ufficiale in PDF"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>{isPdfGenerating ? 'Generazione...' : 'Dispensa PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Step Interactive Navigation Bar */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-3 sm:px-6 py-2 gap-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(t.id);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {t.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body (Organized by Steps) */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-300 leading-relaxed text-sm">
          
          {/* ========================================================================= */}
          {/* STEP 1: TEORIA & FONDAMENTI */}
          {/* ========================================================================= */}
          {activeTab === 'theory' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Summary Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider font-mono">
                    Executive Summary & Obiettivo Operativo
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
                    {module.summary}
                  </p>
                </div>
              </div>

              {/* Theory Body */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {module.theory.heading}
                </h3>

                <div className="space-y-3.5 text-slate-300 text-sm leading-relaxed">
                  {module.theory.paragraphs.map((para, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-all"
                    >
                      <p className="whitespace-pre-line leading-relaxed">{para}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                  Punti Chiave Istituzionali
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {module.theory.keyTakeaways.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Step Forward CTA */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveTab('math');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <span>Passo 2: Formule & Simulatore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: FORMULE & SIMULATORE INTERATTIVO */}
          {/* ========================================================================= */}
          {activeTab === 'math' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Formula Box if Present */}
              {module.theory.formulaBox && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-wide font-mono">
                    <Calculator className="w-4 h-4" />
                    <span>{module.theory.formulaBox.title}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 font-mono text-cyan-300 text-sm sm:text-base font-black tracking-wide text-center">
                    {module.theory.formulaBox.formula}
                  </div>
                  <p className="text-xs text-slate-400 italic text-center">
                    {module.theory.formulaBox.explanation}
                  </p>
                </div>
              )}

              {/* Interactive Dynamic Simulator Widget */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                  Laboratorio Matematico Interattivo
                </h4>
                <AcademySimulators moduleId={module.id} />
              </div>

              {/* Practical Case Study Box */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wide font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Caso Studio & Esempio Pratico Reale</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-200">
                  <span className="font-bold text-amber-300">Scenario: </span>
                  {module.theory.exampleBox.scenario}
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-line border border-slate-800 leading-relaxed">
                  {module.theory.exampleBox.calculation}
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Esito Finale: {module.theory.exampleBox.result}</span>
                </div>
              </div>

              {/* Bottom Step Navigation */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('theory')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  ← Torna alla Teoria
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveTab('challenge');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <span>Passo 3: Mettiti alla Prova</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TERMINALE SANDBOX & FLAG CHALLENGE */}
          {/* ========================================================================= */}
          {activeTab === 'challenge' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* SPAWN TARGET LIVE SANDBOX CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black text-emerald-400 uppercase tracking-wide font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Laboratorio Diretto (Live Sandbox Desk)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200">{module.targetLab.instructions}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onSpawnLab(module.targetLab.symbol);
                  }}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{module.targetLab.actionName}</span>
                </button>
              </div>

              {/* TARGET FLAG CHALLENGE FORM */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                      Target Challenge (+{module.xp} XP)
                    </h4>
                  </div>
                  {isCompleted && (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      Flag Conquistata
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 text-sm font-medium text-slate-100">
                  {module.challenge.question}
                </div>

                <form onSubmit={handleSubmitFlag} className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="Digita qui la risposta o il valore..."
                      className="w-full flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs font-mono transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                    >
                      [ CONFERMA FLAG ]
                    </button>
                  </div>

                  {/* Error Message */}
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Success Message with High-Converting Bridge to Demo Terminal */}
                  {successMsg && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-cyan-500/15 border border-emerald-500/40 text-xs sm:text-sm space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2.5 text-emerald-300">
                        <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
                        <span className="font-bold">{successMsg}</span>
                      </div>
                      
                      <div className="p-3.5 rounded-xl bg-slate-950/85 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-left">
                          <span className="text-white font-bold text-xs block">Metti in pratica sui mercati reali simulati</span>
                          <span className="text-[11px] text-slate-400">Attiva subito il tuo Terminale Operativo Sandbox con $10,000 demo gratuiti.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            trackDemoAccountPrompt(module.id);
                            onSpawnLab(module.targetLab.symbol);
                          }}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all hover:scale-105 shadow-md shadow-cyan-500/20"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Apri Terminale Demo ($10,000)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hint Toggle */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{showHint ? 'Nascondi suggerimento' : 'Hai un dubbio? Mostra suggerimento'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="sm:hidden text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold font-mono"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Scarica Dispensa PDF</span>
                    </button>
                  </div>

                  {showHint && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic animate-in fade-in">
                      💡 {module.challenge.hint}
                    </div>
                  )}
                </form>
              </div>

              {/* Bottom Return to Math */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('math')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  ← Torna al Laboratorio & Formule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar between Modules */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0 font-mono">
          <button
            type="button"
            onClick={onPrevModule}
            disabled={!onPrevModule}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              onPrevModule
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'opacity-40 cursor-not-allowed text-slate-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Modulo Precedente</span>
          </button>

          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
            Usa i tab in alto per navigare tra Teoria, Simulatore e Challenge
          </span>

          <button
            type="button"
            onClick={onNextModule}
            disabled={!onNextModule}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              onNextModule
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'opacity-40 cursor-not-allowed text-slate-600 bg-slate-800'
            }`}
          >
            <span>Modulo Successivo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* High-Converting Lead Capture Modal for Handbook Download */}
      <AcademyLeadCaptureModal
        module={module}
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSuccessDownload={(leadInfo) => {
          setShowLeadModal(false);
          executePdfDownload(leadInfo.name);
        }}
      />
    </div>
  );
};
