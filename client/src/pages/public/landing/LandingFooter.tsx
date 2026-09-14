import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 pt-8 pb-4 space-y-4 text-xs font-mono text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-black text-white text-base tracking-wider">
            APEX<span className="text-cyan-400">TRADER</span>
          </span>
          <span className="text-[10px] text-slate-500">v2.0 Institutional Platform</span>
        </div>

        {/* Real-Time Status Indicator */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Tutti i Sistemi Operativi • Latenza &lt; 5ms</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 leading-relaxed text-center sm:text-left">
        <strong>Infrastruttura & Conformità:</strong> ApexTrader fornisce una piattaforma tecnologica per il monitoraggio e la rendicontazione di strategie finanziarie. Tutte le transazioni e le allocazioni sono regolate e verificate dal motore crittografico a doppia partita contabile.
      </p>
    </footer>
  );
};
