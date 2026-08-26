import React from 'react';

export const LandingComparison: React.FC = () => {
  return (
    <section className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6 shadow-xl">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest block">
          CONFRONTO ARCHITETTURALE
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Perché ApexTrader è Superiore
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4">Parametro Finanziario</th>
              <th className="py-3 px-4 text-cyan-400 font-bold bg-cyan-950/40 rounded-t-xl">ApexTrader Platform</th>
              <th className="py-3 px-4 text-slate-500">Piattaforme Tradizionali</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-3 px-4 font-semibold text-white">Protezione del Capitale</td>
              <td className="py-3 px-4 font-bold text-emerald-400 bg-cyan-950/20">Conto Segregato a Rischio Protetto</td>
              <td className="py-3 px-4 text-rose-400">Esposizione Diretta Non Garantita</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-white">Flusso Quotazioni & Trasparenza</td>
              <td className="py-3 px-4 font-bold text-cyan-300 bg-cyan-950/20">Feed Istituzionale Sub-Millisecondo</td>
              <td className="py-3 px-4 text-slate-500">Prezzi Interni Manipolati o in Ritardo</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-white">Contabilità & Tracciamento</td>
              <td className="py-3 px-4 font-bold text-white bg-cyan-950/20">Doppia Partita Contabile Immutabile</td>
              <td className="py-3 px-4 text-slate-500">Saldi Virtuali Non Verificabili</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-white">Estratto Conto Ufficiale PDF</td>
              <td className="py-3 px-4 font-bold text-emerald-400 bg-cyan-950/20">Incluso con Sigillo SHA-256</td>
              <td className="py-3 px-4 text-slate-500">Report Assenti o Non Certificati</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-semibold text-white">Console Risk Desk & Backoffice</td>
              <td className="py-3 px-4 font-bold text-cyan-300 bg-cyan-950/20">Audit Trail Completo & Gestione 360°</td>
              <td className="py-3 px-4 text-slate-500">Pannello Non Disponibile</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
