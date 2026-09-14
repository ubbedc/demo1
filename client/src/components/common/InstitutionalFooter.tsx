import React, { useState } from 'react';
import { LegalPolicyModal, LegalTabType } from './LegalPolicyModal';
import { Shield, Lock, Scale, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';

interface InstitutionalFooterProps {
  className?: string;
}

export const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({ className = '' }) => {
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; tab: LegalTabType }>({
    isOpen: false,
    tab: 'disclaimer',
  });

  const openLegalModal = (tab: LegalTabType) => {
    setLegalModalState({ isOpen: true, tab });
  };

  return (
    <>
      <footer className={`border-t border-slate-800/80 bg-slate-950/70 pt-10 pb-8 space-y-6 text-xs font-sans text-slate-400 ${className}`}>
        {/* Upper Institutional Badges */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/20">
              ▲
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight block">
                ApexTrader <span className="text-cyan-400">Institutional</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Laboratorio Quantitativo & Simulatore di Mercato v2.0
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Feed Quotazioni Sub-5ms</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audit Ledger SHA-256</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ambiente 100% Didattico & Sandbox</span>
            </div>
          </div>
        </div>

        {/* Mandatory Risk Disclaimer for Google Ads Financial Policy */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>AVVISO DI RISCHIO OBBLIGATORIO & DICHIARAZIONE DI CONFORMITÀ DIDATTICA</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ApexTrader e i moduli della Quant Academy operano esclusivamente come strumenti didattici, accademici e di simulazione tecnologica su dati virtuali. Nessun capitale reale viene raccolto, intermediato o gestito. La piattaforma non fornisce consulenza personalizzata in materia di investimenti, né raccomandazioni operative né sollecitazione al pubblico risparmio ai sensi della normativa MiFID II. Le performance passate, backtestate o simulate non costituiscono in alcun modo garanzia di risultati futuri sui mercati finanziari.
          </p>
        </div>

        {/* Legal Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openLegalModal('disclaimer')}
              className="hover:text-amber-400 transition-colors underline cursor-pointer"
            >
              Avviso di Rischio Completo
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLegalModal('privacy')}
              className="hover:text-cyan-400 transition-colors underline cursor-pointer"
            >
              Privacy Policy (GDPR)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLegalModal('terms')}
              className="hover:text-cyan-400 transition-colors underline cursor-pointer"
            >
              Termini di Servizio
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLegalModal('methodology')}
              className="hover:text-emerald-400 transition-colors underline cursor-pointer"
            >
              Metodologia Quantitativa
            </button>
          </div>

          <div className="text-center sm:text-right">
            <span>© {new Date().getFullYear()} ApexTrader Technologies. Tutti i diritti riservati.</span>
          </div>
        </div>

        {/* Company & Support Contact Transparency for Google Ads Requirements */}
        <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div>
            <strong className="text-slate-400">ApexTrader Technologies</strong> • Piattaforma Didattica & Laboratorio Software EdTech
          </div>
          <div className="flex items-center gap-2">
            <span>Supporto Desk Didattico:</span>
            <a href="mailto:support@apextrader.demo" className="text-cyan-400 hover:underline font-bold">
              support@apextrader.demo
            </a>
          </div>
        </div>

        {/* Google Ads Landing Pages Quick Switcher */}
        <div className="pt-2 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
          <span className="text-slate-400 font-bold">🚀 Anteprima Landing Page Google Ads:</span>
          <div className="flex flex-wrap items-center gap-2 text-cyan-400">
            <a href="/lp" className="hover:underline hover:text-white">Landing Principale (/lp)</a>
            <span>•</span>
            <a href="/lp?topic=leverage" className="hover:underline hover:text-white">Leva & Liquidazione</a>
            <span>•</span>
            <a href="/lp?topic=risk" className="hover:underline hover:text-white">Rischio 1%</a>
            <span>•</span>
            <a href="/lp?topic=spread" className="hover:underline hover:text-white">Spread & Book</a>
            <span>•</span>
            <a href="/lp?topic=pips" className="hover:underline hover:text-white">Valore Pip</a>
          </div>
        </div>
      </footer>

      <LegalPolicyModal
        isOpen={legalModalState.isOpen}
        initialTab={legalModalState.tab}
        onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
