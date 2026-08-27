import React, { useState } from 'react';
import { AcademyModule } from '../../constants/htbAcademyCurriculum';
import { generateModuleHandbookPdf } from '../../services/academyPdfGenerator';
import { triggerHaptic } from '../../utils/haptics';
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
  const [flagInput, setFlagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(isCompleted ? module.challenge.explanationOnSuccess : null);
  const [showHint, setShowHint] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const handleDownloadPdf = () => {
    try {
      setIsPdfGenerating(true);
      generateModuleHandbookPdf(module, userName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleSubmitFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    const cleanInput = flagInput.trim().toLowerCase();
    const isCorrect = module.challenge.acceptableAnswers.some(
      (ans) => ans.toLowerCase() === cleanInput || cleanInput.includes(ans.toLowerCase())
    );

    if (isCorrect) {
      triggerHaptic('success');
      setErrorMsg(null);
      setSuccessMsg(module.challenge.explanationOnSuccess);
      if (!isCompleted) {
        onCompleteModule(module.id, module.xp);
      }
    } else {
      triggerHaptic('error');
      setErrorMsg('Risposta non corretta. Rileggi attentamente l’esempio pratico o usa il suggerimento!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
              {module.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-bold tracking-tight">{module.tierName}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-slate-400">⏱️ {module.duration}</span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-amber-400 font-bold">+{module.xp} XP</span>
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

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-300 leading-relaxed text-sm">
          {/* Executive Summary Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
            <Layers className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider mb-1">
                Executive Summary & Obiettivo Didattico
              </h4>
              <p className="text-xs text-slate-300">{module.summary}</p>
            </div>
          </div>

          {/* Theory Sections */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {module.theory.heading}
            </h3>

            {module.theory.paragraphs.map((para, idx) => (
              <p key={idx} className="text-slate-300 whitespace-pre-line text-xs sm:text-sm">
                {para}
              </p>
            ))}
          </div>

          {/* Formula Box if Present */}
          {module.theory.formulaBox && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-wide">
                <span>📐</span>
                <span>{module.theory.formulaBox.title}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 font-mono text-cyan-300 text-xs sm:text-sm font-bold">
                {module.theory.formulaBox.formula}
              </div>
              <p className="text-[11px] text-slate-400">{module.theory.formulaBox.explanation}</p>
            </div>
          )}

          {/* Practical Case Study Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wide">
              <span>💡</span>
              <span>Caso Studio Operativo & Esempio Pratico Reale</span>
            </div>
            <div className="text-xs text-slate-200">
              <span className="font-bold text-amber-300">Scenario: </span>
              {module.theory.exampleBox.scenario}
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 font-mono text-xs text-slate-300 whitespace-pre-line border border-slate-800">
              {module.theory.exampleBox.calculation}
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>✓ Esito:</span>
              <span>{module.theory.exampleBox.result}</span>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Punti Chiave Istituzionali
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {module.theory.keyTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SPAWN TARGET LIVE SANDBOX CTA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black text-emerald-400 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Laboratorio Operativo (Live Target Sandbox)</span>
              </div>
              <p className="text-xs text-slate-300">{module.targetLab.instructions}</p>
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
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Target Flag Challenge (+{module.xp} XP)
                </h4>
              </div>
              {isCompleted && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Flag Risolta
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-200">{module.challenge.question}</p>

            <form onSubmit={handleSubmitFlag} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <input
                  type="text"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  placeholder="Inserisci qui il valore / risposta..."
                  className="w-full flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  [ SUBMIT FLAG ]
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Hint Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Nascondi suggerimento' : 'Mostra suggerimento'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="sm:hidden text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Scarica PDF</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 italic animate-in fade-in">
                  💡 {module.challenge.hint}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
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
            <span>Precedente</span>
          </button>

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
    </div>
  );
};
