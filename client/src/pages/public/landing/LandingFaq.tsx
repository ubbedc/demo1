import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Come funziona la gestione del conto e l\'allocazione del capitale?',
      a: 'Ogni account viene inizializzato con un conto segregato protetto a $0.00. Il capitale operativo viene successivamente allocato e gestito direttamente dal Risk Desk centrale, garantendo il pieno controllo del rischio e l\'assoluta trasparenza delle operazioni.',
    },
    {
      q: 'I dati di mercato e i feed dei prezzi sono reali?',
      a: 'Assolutamente sì. Per tutti gli asset crypto principali (BTC, ETH, SOL) la piattaforma è interfacciata direttamente agli stream WebSocket e REST ad altissima frequenza con latenza sub-secondo. Per il Forex, le Materie Prime e gli Indici mondiali, il motore quantitativo applica fluttuazioni di liquidità conformi ai mercati istituzionali.',
    },
    {
      q: 'Come posso ottenere l\'Estratto Conto Ufficiale Certificato?',
      a: 'In qualsiasi momento, sia il cliente dalla propria postazione che l\'amministratore dalla scheda 360° possono generare e scaricare con un click il Rendiconto Finanziario Certificato in formato PDF o CSV, completo di timbro di conformità e codice di verifica crittografico SHA-256.',
    },
    {
      q: 'Come vengono gestiti gli ordini automatici di Take Profit e Stop Loss?',
      a: 'L\'Execution Engine proprietario monitora i tick di prezzo in tempo reale con latenza inferiore a 5ms. Al raggiungimento del target di Take Profit o del livello di protezione Stop Loss stabilito dal Desk, la posizione viene liquidata istantaneamente con accredito automatico del profitto o del debito sulla cassa.',
    },
    {
      q: 'La piattaforma è accessibile anche da smartphone e postazioni mobili?',
      a: 'Certamente. ApexTrader integra un\'architettura responsive di grado professionale: su schermi desktop offre una workspace a quattro quadranti in stile Bloomberg Terminal, mentre su smartphone adatta l\'interfaccia con gesture touch, swipe veloci e navigazione a schede.',
    },
  ];

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest block">
          DOMANDE FREQUENTI
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Informazioni sulla Piattaforma
        </h2>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div 
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-white font-bold cursor-pointer hover:bg-slate-800/40"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  {faq.q}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-slate-400 font-sans text-xs leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
