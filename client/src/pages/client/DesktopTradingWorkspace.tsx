import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { PortfolioSummary, Position, Order, Transaction } from '../../types';
import { InteractiveChart } from '../../components/common/InteractiveChart';
import { StatementExportModal } from '../../components/common/StatementExportModal';
import { DesktopAssetMonitor } from './components/DesktopAssetMonitor';
import { DesktopOrderBook } from './components/DesktopOrderBook';
import { DesktopBottomTabs } from './components/DesktopBottomTabs';
import { ClientPortfolioCard } from './components/ClientPortfolioCard';
import { generateStatementPDF } from '../../services/pdfGenerator';
import { formatPrice, formatPercent } from '../../utils/formatters';
import { ShieldCheck, Eye, Activity } from 'lucide-react';

interface DesktopWorkspaceProps {
  portfolio: PortfolioSummary | null;
  positions: Position[];
  orders: Order[];
  transactions: Transaction[];
  onRefreshData: () => void;
}

export const DesktopTradingWorkspace: React.FC<DesktopWorkspaceProps> = ({
  portfolio,
  positions,
  orders,
  transactions,
}) => {
  const { quotes, selectedSymbol, selectedQuote, setSelectedSymbol, priceDirections } = useMarket();
  const { user } = useAuth();
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const quote = selectedQuote;

  const handleDirectDownloadPDF = () => {
    generateStatementPDF({
      user: {
        fullName: user?.fullName || 'Trader Account',
        email: user?.email || 'trader@apextrader.demo',
        accountNumber: user?.accountNumber || 'APX-ACCOUNT',
      },
      portfolio,
      orders,
      transactions,
    });
  };

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Top Selected Asset Status Ribbon */}
      {quote && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">{quote.symbol}</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase">
                {quote.assetClass}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <div>
              <span className="text-slate-500 text-[10px] block">ULTIMO PREZZO</span>
              <span className="text-base font-black text-white">
                {formatPrice(quote.last, quote.assetClass)}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <div>
              <span className="text-slate-500 text-[10px] block">VARIAZIONE 24H</span>
              <span className={`font-black ${quote.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPercent(quote.change24h)}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <div>
              <span className="text-slate-500 text-[10px] block">SPREAD BID / ASK</span>
              <span className="font-bold text-cyan-400">
                ${(quote.ask - quote.bid).toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              <Eye className="w-3.5 h-3.5" />
              Conto Spettatore Live (Gestito da CRM)
            </span>
          </div>
        </div>
      )}

      {/* 3. Main Trading Floor (3 Columns: Asset Monitor + TradingView Chart + Order Book) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Asset Monitor (1/4 cols) */}
        <div className="lg:col-span-1">
          <DesktopAssetMonitor
            quotes={quotes}
            selectedSymbol={selectedSymbol}
            priceDirections={priceDirections}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>

        {/* Center & Right Column: Chart + Order Book (3/4 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <InteractiveChart quote={quote} />
          <DesktopOrderBook quote={quote} />
        </div>
      </div>

      {/* 4. Executive Portfolio Summary Card */}
      <ClientPortfolioCard
        portfolio={portfolio}
        positions={positions}
        accountNumber={user?.accountNumber}
        onOpenStatement={() => setIsStatementOpen(true)}
      />

      {/* 5. Bottom Activity Tabs (Positions, Orders, Ledger) */}
      <DesktopBottomTabs
        positions={positions}
        orders={orders}
        transactions={transactions}
        onOpenStatement={() => setIsStatementOpen(true)}
        onDirectDownloadPDF={handleDirectDownloadPDF}
      />

      {/* 5. Statement Export Modal */}
      {isStatementOpen && (
        <StatementExportModal
          user={{
            fullName: user?.fullName || 'Trader Account',
            email: user?.email || 'trader@apextrader.demo',
            accountNumber: user?.accountNumber || 'APX-ACCOUNT',
          }}
          portfolio={portfolio}
          orders={orders}
          transactions={transactions}
          onClose={() => setIsStatementOpen(false)}
        />
      )}
    </div>
  );
};
