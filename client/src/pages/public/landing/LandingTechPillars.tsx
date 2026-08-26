import React from 'react';
import { Zap, Database, Shield, Volume2 } from 'lucide-react';

export const LandingTechPillars: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Tecnologie Istituzionali di Punta
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Progettata per garantire affidabilità, precisione matematica e trasparenza contabile
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">TradingView Canvas</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Motore grafico professionale con candele giapponesi, istogramma volumi e rilevamento OHLC istantaneo.
          </p>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Doppia Partita Contabile</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ogni accredito, operazione a mercato e liquidazione genera un movimento di cassa immutabile a virgola fissa.
          </p>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Audit Trail & CRM 360°</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Console amministrativa con log crittografici, allocazione fondi, apertura ordini e gestione rischio globale.
          </p>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Segnali Audio & Notifiche Live</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Feedback acustico nativo Web Audio API e notifiche push in tempo reale ad ogni variazione o chiusura ordine.
          </p>
        </div>
      </div>
    </section>
  );
};
