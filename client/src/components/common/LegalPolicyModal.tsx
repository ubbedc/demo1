import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, FileText, Scale, Lock, Building2 } from 'lucide-react';

export type LegalTabType = 'disclaimer' | 'privacy' | 'terms' | 'methodology';

interface LegalPolicyModalProps {
  isOpen: boolean;
  initialTab?: LegalTabType;
  onClose: () => void;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  initialTab = 'disclaimer',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Note Legali, Conformità & Trasparenza Istituzionale
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ApexTrader Regulatory & Compliance Framework • Rev. 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-4 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Avviso di Rischio (Disclaimer)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Privacy Policy (GDPR)</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'terms'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Termini e Condizioni</span>
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'methodology'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Metodologia Didattica</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300">
          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  IMPORTANTE: FINALITÀ DIDATTICA & SIMULAZIONE SENZA RISCHIO
                </div>
                <p>
                  ApexTrader e la sua Quant Academy operano esclusivamente come ambienti di formazione quantitativa, laboratorio algoritmico e simulazione su dati di mercato virtualizzati.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <h4 className="text-sm font-bold text-white">1. Assenza di Raccomandazioni o Consulenza Finanziaria</h4>
                <p>
                  Tutti i contenuti, i compendi didattici, le formule matematiche, i simulatori e i materiali forniti dalla piattaforma hanno finalità unicamente illustrative, matematiche ed educative. Nessun contenuto presente costituisce o deve essere inteso come sollecitazione al pubblico risparmio, consulenza personalizzata in materia di investimenti o raccomandazione finanziaria ai sensi della normativa MiFID II o delle direttive Consob/ESMA.
                </p>

                <h4 className="text-sm font-bold text-white">2. Capitale Reale Non Gestito & Simulazione 100% Demo</h4>
                <p>
                  ApexTrader non è un intermediario abilitato né un broker o un istituto di credito. La piattaforma non accetta depositi in valuta reale né gestisce fondi fiduciari. I saldi operativi, le quote azionarie o crittografiche e i rendimenti visualizzati all'interno dell'ambiente di trading demo rappresentano quote di esercizio virtuali prive di valore monetario reale.
                </p>

                <h4 className="text-sm font-bold text-white">3. Asimmetria delle Performance Simulate</h4>
                <p>
                  I risultati conseguiti attraverso simulazioni didattiche, backtesting o esecuzioni sandbox non costituiscono garanzia o indicatore affidabile di risultati futuri sui mercati reali. Il trading sui mercati finanziari, in particolare con strumenti a leva (derivati, CFD, futures), comporta un elevato grado di rischio e può comportare la perdita dell'intero capitale reale investito.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                Informativa sul Trattamento dei Dati Personali (GDPR EU 2016/679)
              </div>
              <p>
                La protezione della tua privacy è per noi fondamentale. ApexTrader adotta un approccio basato sulla minimizzazione dei dati (*Privacy by Design*):
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-white">Dati Raccolti per la Didattica:</strong> Quando richiedi la dispensa PDF o registri il tuo account demo, raccogliamo unicamente Nome ed Indirizzo Email per consentire il recapito dei materiali formativi e il salvataggio dei punti esperienza (XP).
                </li>
                <li>
                  <strong className="text-white">Zero Cessione a Terzi:</strong> I tuoi recapiti non saranno mai ceduti, venduti o condivisi con broker terzi, società di recupero crediti o reti pubblicitarie esterne.
                </li>
                <li>
                  <strong className="text-white">Archiviazione Sicura & Crittografia:</strong> Le password sono protette mediante hashing asimmetrico ad alta resistenza (Bcrypt con salt dedicato). I token di sessione utilizzano standard JSON Web Token (JWT) con scadenza rigida.
                </li>
                <li>
                  <strong className="text-white">Diritto all'Oblio:</strong> Puoi richiedere in qualsiasi momento la cancellazione integrale dei tuoi dati e del tuo profilo demo contattando il Desk all'indirizzo istituzionale di supporto.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                Termini e Condizioni di Utilizzo del Servizio
              </div>
              <p>
                L'accesso alla piattaforma e la consultazione della Quant Academy implicano la piena accettazione dei seguenti termini:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-white">Licenza d'Uso:</strong> Tutti i compendi PDF, i codici sorgente dei laboratori, le formule proprietarie e gli algoritmi di calcolo sono proprietà intellettuale di ApexTrader e sono concessi in licenza individuale per finalità di studio personale.
                </li>
                <li>
                  <strong className="text-white">Divieto di Scraping e Abuso:</strong> È severamente vietato effettuare reverse engineering, data scraping automatizzato o tentativi di sovraccarico (DDoS) sui server della piattaforma.
                </li>
                <li>
                  <strong className="text-white">Integrità dei Registri Audit:</strong> I codici di certificazione e gli hash crittografici (SHA-256) emessi nei rendiconti hanno valore di attestazione della simulazione interna condotta a doppia partita contabile.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Building2 className="w-4 h-4" />
                Standard Didattico Quantitativo & Modelli di Calcolo
              </div>
              <p>
                La Quant Academy di ApexTrader adotta standard didattici quantitativi ispirati alla letteratura accademica internazionale:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-xs block">Formula Prezzo Medio Ponderato</span>
                  <span className="font-mono text-cyan-400 text-[11px]">WAP = ∑(Price_i × Qty_i) / ∑(Qty_i)</span>
                  <p className="text-slate-400 text-[10px]">Standard contabile per l'accurata determinazione del break-even point.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-white text-xs block">Regola del Rischio Unitario (1%)</span>
                  <span className="font-mono text-emerald-400 text-[11px]">Size = (Equity × 1%) / |Entry - SL|</span>
                  <p className="text-slate-400 text-[10px]">Modello di salvaguardia patrimoniale secondo la scuola di Van Tharp.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Documento protetto con audit crittografico</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Ho Compreso e Accetto
          </button>
        </div>
      </div>
    </div>
  );
};
