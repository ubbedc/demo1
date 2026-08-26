import React from 'react';
import { PortfolioSummary, Order, Transaction } from '../../../types';
import { 
  Building2, 
  Scale, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  QrCode 
} from 'lucide-react';

interface StatementDocumentPreviewProps {
  displayUser: { fullName?: string; email?: string; accountNumber?: string } | null;
  portfolio: PortfolioSummary | null;
  orders: Order[];
  transactions: Transaction[];
  statementRef: string;
  sha256Fingerprint: string;
}

export const StatementDocumentPreview: React.FC<StatementDocumentPreviewProps> = ({
  displayUser,
  portfolio,
  orders,
  transactions,
  statementRef,
  sha256Fingerprint,
}) => {
  const totalTrades = orders.length;
  const equity = portfolio?.equity || 0;
  const freeBalance = portfolio?.freeBalance || 0;
  const totalPnL = portfolio?.totalUnrealizedPnL || 0;

  return (
    <div className="p-8 sm:p-12 space-y-8 overflow-y-auto flex-1 bg-slate-900 print:bg-white print:text-black print:p-8 print:space-y-6">
      {/* 1. Header & Bank Letterhead */}
      <div className="border-b-2 border-slate-800 print:border-slate-800 pb-6 flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider text-cyan-400 print:text-slate-950">
              APEX<span className="text-white print:text-cyan-800">TRADER</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded border border-cyan-500/30 print:border-slate-800 print:text-slate-900 print:bg-slate-100">
              Institutional Prime Desk
            </span>
          </div>
          <p className="text-[11px] text-slate-400 print:text-slate-600 leading-tight">
            ApexTrader Asset Management & Financial Markets Custody Ltd.<br />
            Financial Services Regulatory Authority • LEI: 984500A72B894F921E42<br />
            Global Liquidity Provider & Ledger Custody Services
          </p>
        </div>

        <div className="text-right space-y-1 font-mono text-[11px] text-slate-400 print:text-slate-700">
          <div className="bg-slate-950 print:bg-slate-100 p-2.5 rounded-lg border border-slate-800 print:border-slate-300 inline-block text-left">
            <span className="text-[10px] text-slate-500 print:text-slate-600 block uppercase font-bold">Riferimento Rendiconto</span>
            <span className="font-bold text-white print:text-black text-xs">{statementRef}</span>
            <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-1">
              Emissione: {new Date().toLocaleDateString('it-IT')} ore {new Date().toLocaleTimeString('it-IT')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Client Anagrafica & Portfolio Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
        {/* Box A: Intestatario */}
        <div className="bg-slate-950/80 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
          <span className="text-[10px] font-bold text-cyan-400 print:text-slate-700 uppercase tracking-wider block border-b border-slate-800/80 print:border-slate-300 pb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Dati Intestatario Conto Gestito
          </span>
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Nominativo:</span>
              <strong className="text-white print:text-black">{displayUser?.fullName || 'N/D'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Email Registrata:</span>
              <span className="text-slate-300 print:text-slate-800">{displayUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Numero Conto:</span>
              <strong className="text-cyan-400 print:text-slate-950">{displayUser?.accountNumber || 'APX-ACCOUNT'}</strong>
            </div>
          </div>
        </div>

        {/* Box B: Parametri di Gestione */}
        <div className="bg-slate-950/80 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
          <span className="text-[10px] font-bold text-cyan-400 print:text-slate-700 uppercase tracking-wider block border-b border-slate-800/80 print:border-slate-300 pb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            Parametri di Conto & Custodia
          </span>
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Valuta di Base:</span>
              <strong className="text-white print:text-black">USD ($) - Dollaro USA</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Modello Operativo:</span>
              <span className="text-slate-300 print:text-slate-800">Managed Account (Desk CRM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-slate-600">Certificazione:</span>
              <span className="text-emerald-400 print:text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ledger Attivo & Verificato
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Executive Financial Performance Snapshot */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-300 print:text-slate-900 uppercase tracking-wider block">
          Sintesi Patrimoniale di Periodo
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
          <div className="bg-slate-950 print:bg-slate-100 p-3.5 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 text-[10px] block font-bold">VALORE PATRIMONIALE (NAV)</span>
            <span className="text-lg font-black text-white print:text-black font-mono">
              ${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">Saldo Cassa + P/L Live</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-100 p-3.5 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 text-[10px] block font-bold">SALDO DISPONIBILE</span>
            <span className="text-lg font-black text-cyan-400 print:text-cyan-800 font-mono">
              ${freeBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">Liquidità Svincolata</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-100 p-3.5 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 text-[10px] block font-bold">P/L NON REALIZZATO</span>
            <span className={`text-lg font-black font-mono ${totalPnL >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">Posizioni Aperte a Mercato</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-100 p-3.5 rounded-xl border border-slate-800 print:border-slate-300">
            <span className="text-slate-500 print:text-slate-600 text-[10px] block font-bold">OPERAZIONI TOTALI</span>
            <span className="text-lg font-black text-white print:text-black font-mono">{totalTrades}</span>
            <span className="text-[10px] text-slate-500 print:text-slate-600 block mt-0.5">Eseguite dal Desk CRM</span>
          </div>
        </div>
      </div>

      {/* 4. Table of Executed Orders */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-300 print:text-slate-900 uppercase tracking-wider block">
          Registro Esecuzioni Contratti di Trading ({orders.length})
        </span>
        <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-800 font-bold">
              <tr>
                <th className="py-2.5 px-3">Data / Ora</th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Direzione</th>
                <th className="py-2.5 px-3 text-right">Quantità</th>
                <th className="py-2.5 px-3 text-right">Prezzo Eseguito</th>
                <th className="py-2.5 px-3 text-right">Controvalore ($)</th>
                <th className="py-2.5 px-3 text-center">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500">Nessun ordine registrato nel periodo.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-2 px-3 text-slate-400 print:text-slate-700">{new Date(ord.created_at).toLocaleString('it-IT')}</td>
                    <td className="py-2 px-3 font-bold text-white print:text-black">{ord.asset_symbol}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ord.side === 'BUY' 
                          ? 'text-emerald-400 print:text-emerald-700 bg-emerald-500/10' 
                          : 'text-rose-400 print:text-rose-700 bg-rose-500/10'
                      }`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">{ord.quantity}</td>
                    <td className="py-2 px-3 text-right">${ord.executed_price.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-white print:text-black">${ord.notional_value.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center text-emerald-400 print:text-emerald-800 font-bold text-[10px]">{ord.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Certified Ledger Movements Journal */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-300 print:text-slate-900 uppercase tracking-wider block">
          Registro Partita Contabile & Flussi di Liquidità ({transactions.length})
        </span>
        <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-800 font-bold">
              <tr>
                <th className="py-2.5 px-3">Data / Ora</th>
                <th className="py-2.5 px-3">Causale Ledger</th>
                <th className="py-2.5 px-3">Descrizione Operazione</th>
                <th className="py-2.5 px-3 text-right">Importo ($)</th>
                <th className="py-2.5 px-3 text-right">Saldo Risultante ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">Nessun movimento registrato.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-2 px-3 text-slate-400 print:text-slate-700">{new Date(tx.created_at).toLocaleString('it-IT')}</td>
                    <td className="py-2 px-3 font-bold text-cyan-400 print:text-cyan-800">{tx.type}</td>
                    <td className="py-2 px-3 text-slate-300 print:text-slate-800">{tx.description}</td>
                    <td className={`py-2 px-3 text-right font-bold ${tx.amount >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                      {tx.amount >= 0 ? '+' : ''}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white print:text-black">
                      ${tx.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Institutional Security & Dual Sign-off Block */}
      <div className="pt-6 border-t-2 border-slate-800 print:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          {/* Audit Fingerprint Box */}
          <div className="bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 print:text-slate-700 uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
              Certificazione Immutabilità & Sigillo Crittografico
            </span>
            <p className="text-[10px] font-mono text-slate-500 print:text-slate-600 break-all leading-tight">
              SHA-256 Ledger Hash: <br />
              <span className="text-cyan-300 print:text-slate-900 font-bold">{sha256Fingerprint}</span>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 print:text-emerald-700 font-bold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Transazioni verificate a doppia partita contabile.</span>
            </div>
          </div>

          {/* Custodian Signatures */}
          <div className="bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300 flex items-center justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 print:text-slate-600 block uppercase font-bold">Firma Funzionario Autorizzato</span>
                <span className="font-serif italic text-base text-slate-200 print:text-slate-800">ApexTrader Prime Desk Operations</span>
              </div>
              <div className="text-[10px] text-slate-500 print:text-slate-600">
                Compliance & Legal Custody Officer • Timbrato Digitalmente
              </div>
            </div>

            <div className="w-16 h-16 rounded-lg bg-slate-900 print:bg-slate-200 border border-slate-700 print:border-slate-400 flex flex-col items-center justify-center text-[9px] text-center font-mono p-1">
              <QrCode className="w-8 h-8 text-cyan-400 print:text-black mb-0.5" />
              <span className="text-[8px] text-slate-400 print:text-black font-bold">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Footer */}
        <p className="text-[9px] text-slate-500 print:text-slate-500 leading-tight pt-2 border-t border-slate-800/60 print:border-slate-300 text-justify">
          <strong>Nota di Conformità:</strong> Il presente documento costituisce estratto conto ufficiale e certificato di consistenza patrimoniale emesso ai sensi dei regolamenti finanziari vigenti per conti gestiti e simulati. Tutte le posizioni e le registrazioni di cassa sono validate e vincolate dal motore di custodia Ledger. ApexTrader non applica commissioni nascoste sul mantenimento delle posizioni garantite a margine.
        </p>
      </div>
    </div>
  );
};
