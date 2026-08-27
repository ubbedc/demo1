import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PortfolioSummary, Order, Transaction } from '../../types';
import { generateStatementPDF } from '../../services/pdfGenerator';
import { StatementDocumentPreview } from './statement/StatementDocumentPreview';
import { trackAction } from '../../services/telemetry';
import { 
  X, 
  Printer, 
  Download, 
  FileText 
} from 'lucide-react';

interface StatementModalProps {
  user?: { fullName: string; email: string; accountNumber?: string } | null;
  portfolio: PortfolioSummary | null;
  orders?: Order[];
  transactions?: Transaction[];
  onClose: () => void;
}

export const StatementExportModal: React.FC<StatementModalProps> = ({
  user: customUser,
  portfolio,
  orders: customOrders,
  transactions: customTransactions,
  onClose,
}) => {
  const { user: authUser } = useAuth();
  const displayUser = customUser || authUser;

  const [orders, setOrders] = useState<Order[]>(customOrders || []);
  const [transactions, setTransactions] = useState<Transaction[]>(customTransactions || []);
  const [loading, setLoading] = useState(!customOrders || !customTransactions);

  useEffect(() => {
    if (customOrders && customTransactions) {
      setOrders(customOrders);
      setTransactions(customTransactions);
      setLoading(false);
      return;
    }

    const loadStatementData = async () => {
      try {
        const [ord, tx] = await Promise.all([api.getOrders(), api.getTransactions()]);
        setOrders(ord);
        setTransactions(tx);
      } catch (err) {
        console.error('Failed to load statement:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStatementData();
  }, [customOrders, customTransactions]);

  const equity = portfolio?.equity || 0;

  // Generate deterministic audit verification code based on account & date
  const statementRef = `APX-STMT-${(displayUser?.accountNumber || 'DEMO').replace(/[^a-zA-Z0-9]/g, '')}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const handleDownloadPDF = () => {
    trackAction('PDF_DOWNLOAD', { account: displayUser?.accountNumber });
    generateStatementPDF({
      user: displayUser,
      portfolio,
      orders,
      transactions,
    });
  };

  const handlePrint = () => {
    trackAction('STATEMENT_PRINT');
    window.print();
  };

  const handleExportCSV = () => {
    trackAction('CSV_EXPORT', { account: displayUser?.accountNumber });
    const headers = ['Data (UTC)', 'Causale / Tipo', 'Strumento', 'Direzione', 'Quantita', 'Prezzo ($)', 'Controvalore ($)', 'Stato / Note'];
    const rows = orders.map((o) => [
      new Date(o.created_at).toISOString(),
      o.type,
      o.asset_symbol,
      o.side,
      o.quantity,
      o.executed_price,
      o.notional_value,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Estratto_Conto_${(displayUser?.fullName || 'Cliente').replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[94vh] flex flex-col font-sans text-xs text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none print:m-0">
        
        {/* Top Floating Action Bar (Hidden during Print/PDF Generation) */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-wide">Rendiconto Finanziario Ufficiale & Report PDF</h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Documento Istituzionale per <strong className="text-cyan-400">{displayUser?.fullName}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Esporta</span> CSV
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Stampa</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 sm:px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/30 hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              Scarica File PDF (.pdf)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Caricamento dati certificati in corso...
          </div>
        ) : (
          <StatementDocumentPreview
            displayUser={displayUser}
            portfolio={portfolio}
            orders={orders}
            transactions={transactions}
            statementRef={statementRef}
            sha256Fingerprint={sha256Fingerprint}
          />
        )}
      </div>
    </div>
  );
};
