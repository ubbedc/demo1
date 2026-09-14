import React, { useState } from 'react';
import { AcademyModule } from '../../../constants/htbAcademyCurriculum';
import { trackLeadGenerated } from '../../../services/marketingTracker';
import { triggerHaptic } from '../../../utils/haptics';
import {
  FileDown,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Mail,
  User,
} from 'lucide-react';

interface AcademyLeadCaptureModalProps {
  module: AcademyModule;
  isOpen: boolean;
  onClose: () => void;
  onSuccessDownload: (leadInfo: { name: string; email: string }) => void;
}

export const AcademyLeadCaptureModal: React.FC<AcademyLeadCaptureModalProps> = ({
  module,
  isOpen,
  onClose,
  onSuccessDownload,
}) => {
  const [fullName, setFullName] = useState(() => {
    return localStorage.getItem('apex_lead_name') || '';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('apex_lead_email') || '';
  });
  const [acceptUpdates, setAcceptUpdates] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Inserisci un indirizzo email valido per ricevere la dispensa.');
      triggerHaptic('warning');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Persist locally so visitor doesn't have to fill this in for subsequent module PDFs
    localStorage.setItem('apex_lead_email', cleanEmail);
    if (cleanName) {
      localStorage.setItem('apex_lead_name', cleanName);
    }

    // Fire conversion tracking for Google Ads and internal CRM
    trackLeadGenerated({
      email: cleanEmail,
      name: cleanName,
      moduleId: module.id,
      moduleTitle: module.title,
      source: 'academy_pdf_handbook',
    });

    triggerHaptic('success');
    setIsSubmitting(false);

    // Call success handler to generate/download the PDF
    onSuccessDownload({
      name: cleanName || 'Studente Quant',
      email: cleanEmail,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-sans text-slate-200 relative">
        {/* Glow Header Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between relative bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                COMPENDIO UFFICIALE APEXTRADER
              </span>
              <h3 className="font-bold text-white text-base tracking-tight">
                Scarica la Dispensa Didattica PDF
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Module Info Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="font-bold text-cyan-400">{module.id}</span>
              <span>{module.duration} di studio</span>
            </div>
            <h4 className="font-black text-white text-sm tracking-tight">{module.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-2">{module.summary}</p>
          </div>

          {/* Value Props Bullet List */}
          <div className="space-y-2 text-xs text-slate-300">
            <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Cosa include il tuo documento ufficiale:
            </span>
            <div className="grid grid-cols-1 gap-1.5 pl-1">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Formulario matematico completo pronto per Excel / Python</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Checklist istituzionale di gestione del rischio del Desk</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Caso studio pratico e soluzioni della challenge didattica</span>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nome e Cognome</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="es. Marco Rossi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Indirizzo Email Ufficiale <strong className="text-emerald-400">*</strong></span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@azienda.com oppure nome@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-sans"
              />
            </div>
          </div>

          {/* Privacy Consent Checkbox */}
          <label className="flex items-start gap-2.5 text-[11px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptUpdates}
              onChange={(e) => setAcceptUpdates(e.target.checked)}
              className="mt-0.5 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span>
              Desidero ricevere analisi quantitative settimanali e aggiornamenti didattici dal Desk. Nessun invio di spam né cessione a broker terzi (GDPR).
            </span>
          </label>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>Scarica Dispensa PDF Subito</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Continua a Schermo
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>Crittografia SSL 256-bit • Riservatezza Garantita</span>
          </div>
        </form>
      </div>
    </div>
  );
};
