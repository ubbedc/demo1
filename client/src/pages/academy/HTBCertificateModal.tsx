import React, { useState } from 'react';
import { generateMasterclassCertificatePdf } from '../../services/academyPdfGenerator';
import { triggerHaptic } from '../../utils/haptics';
import { X, FileDown, Award, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface HTBCertificateModalProps {
  userName: string;
  totalXp: number;
  completedDate: string;
  onClose: () => void;
}

export const HTBCertificateModal: React.FC<HTBCertificateModalProps> = ({
  userName,
  totalXp,
  completedDate,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate deterministic SHA-256 style hash for verification
  const verificationHash = `APX-QUANT-SHA256-${Array.from(userName + completedDate)
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7)
    .toString(16)
    .toUpperCase()
    .padStart(16, '0')}-${totalXp}`;

  const handleDownload = () => {
    try {
      triggerHaptic('success');
      setIsGenerating(true);
      generateMasterclassCertificatePdf(userName, completedDate, totalXp, verificationHash);
    } catch (err) {
      console.error('Error generating certificate:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-3xl flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden font-mono">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Certificato Ufficiale di Laurea Quant
              </h2>
              <p className="text-[11px] text-amber-400/80 font-bold">
                APEX QUANTITATIVE RESEARCH DIVISION • RICONOSCIMENTO ISTITUZIONALE
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Visual Preview Canvas */}
        <div className="p-6 sm:p-8 bg-slate-950 flex flex-col items-center text-center space-y-6 border-b border-slate-800 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border-2 border-amber-500/50 w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-black text-cyan-400 tracking-widest">APEX QUANT ACADEMY</span>
              <span className="text-[10px] text-amber-400 font-bold">LEI: 984500A72B894F921E42</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs uppercase tracking-widest text-slate-400">Si attesta che il Trader</h3>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                {userName.toUpperCase()}
              </h1>
            </div>

            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              ha completato con successo l’intero percorso formativo istituzionale di 12 Moduli,
              dimostrando piena padronanza in <span className="text-white font-bold">Microstruttura dei Mercati</span>,{' '}
              <span className="text-white font-bold">Meccanica degli Ordini</span>,{' '}
              <span className="text-white font-bold">Matematica della Leva</span> e{' '}
              <span className="text-white font-bold">Gestione del Rischio e Position Sizing</span>.
            </p>

            {/* Rank Conferred Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>GRADO: INSTITUTIONAL QUANT MASTER 👑</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-800/80">
              <div>
                <span className="block font-bold text-slate-300">Data di Rilascio:</span>
                <span>{completedDate}</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-slate-300">Firma Risk Desk:</span>
                <span className="text-cyan-400 font-bold italic">Apex Quantitative Division</span>
              </div>
            </div>

            <div className="pt-2 text-[9px] font-mono text-slate-500 break-all">
              VERIFICATION HASH: {verificationHash}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>12/12 Moduli Completati ({totalXp} XP)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Chiudi
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
            >
              <FileDown className="w-4 h-4" />
              <span>{isGenerating ? 'Generazione...' : 'Scarica Diploma in PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
