import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const LandingJourney: React.FC = () => {
  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest block">
          FLUSSO OPERATIVO STRUTTURATO
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Come Opera la Piattaforma
        </h2>
        <p className="text-sm text-slate-400">
          Un'architettura trasparente che unisce l'esperienza visiva del cliente alla gestione avanzata del Desk Istituzionale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 relative shadow-lg hover:border-cyan-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black font-mono text-lg">
            01
          </div>
          <h3 className="font-bold text-white text-lg">Attivazione Conto Segregato</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Registrazione immediata. Il conto viene predisposto con identificativo univoco e contabilità a doppia partita segregata.
          </p>
          <div className="pt-2 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Accesso Immediato al Terminale
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 relative shadow-lg hover:border-cyan-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black font-mono text-lg">
            02
          </div>
          <h3 className="font-bold text-white text-lg">Trading Desk & Allocazione</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Il Desk operativo alloca il capitale, definisce i parametri di Take Profit e Stop Loss ed esegue le strategie a mercato.
          </p>
          <div className="pt-2 text-[11px] font-mono text-blue-400 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Automazione TP/SL & Esecuzione &lt; 5ms
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 relative shadow-lg hover:border-cyan-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black font-mono text-lg">
            03
          </div>
          <h3 className="font-bold text-white text-lg">Live Terminal & Estratto PDF</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Il cliente monitora le posizioni in tempo reale con avvisi audio/visivi e scarica il rendiconto patrimoniale ufficiale certificato.
          </p>
          <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Certificazione Crittografica SHA-256
          </div>
        </div>
      </div>
    </section>
  );
};
