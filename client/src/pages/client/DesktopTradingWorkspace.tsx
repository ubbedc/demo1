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
import { TradeActionTicket } from './components/TradeActionTicket';
import { api } from '../../services/api';
import { Button } from '../../components/ui';
import { RotateCcw, ShieldCheck, Eye, Activity, Sparkles } from 'lucide-react';

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
  onRefreshData,
}) => {
  const { quotes, selectedSymbol, selectedQuote, setSelectedSymbol, priceDirections } = useMarket();
  const { user } = useAuth();
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const quote = selectedQuote;

  const handleResetBalance = async () => {
    try {
      setIsResetting(true);
      await api.resetDemoBalance();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Errore durante la ricarica del conto demo.');
    } finally {
      setIsResetting(false);
    }
  };

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
            <Button
              variant="outline"
              size="sm"
              isLoading={isResetting}
              onClick={handleResetBalance}
              icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
              title="Ripristina il saldo iniziale di $10,000 per continuare a testare strategie"
            >
              Ricarica $10,000 Demo
            </Button>

            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Terminale Operativo Live
            </span>
          </div>
        </div>
      )}

      {/* 2. Main Trading Floor: 12-Column Layout (Watchlist 3 / Chart & Depth 6 / Order Ticket 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Asset Watchlist (3/12 cols = 25%) */}
        <div className="lg:col-span-3">
          <DesktopAssetMonitor
            quotes={quotes}
            selectedSymbol={selectedSymbol}
            priceDirections={priceDirections}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>

        {/* Center Column: Chart + Order Book (6/12 cols = 50%) */}
        <div className="lg:col-span-6 space-y-4">
          <InteractiveChart quote={quote} />
          <DesktopOrderBook quote={quote} />
        </div>

        {/* Right Column: Order Entry Ticket Desk (3/12 cols = 25%) */}
        <div className="lg:col-span-3 space-y-4">
          <TradeActionTicket
            quote={quote}
            portfolio={portfolio}
            onOrderSuccess={onRefreshData}
          />
        </div>
      </div>

      {/* 3. Executive Portfolio Summary Card */}
      <ClientPortfolioCard
        portfolio={portfolio}
        positions={positions}
        accountNumber={user?.accountNumber}
        onOpenStatement={() => setIsStatementOpen(true)}
      />

      {/* 4. Bottom Activity Tabs (Positions with Close action, Orders, Ledger) */}
      <DesktopBottomTabs
        positions={positions}
        orders={orders}
        transactions={transactions}
        onOpenStatement={() => setIsStatementOpen(true)}
        onDirectDownloadPDF={handleDirectDownloadPDF}
        onRefreshData={onRefreshData}
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
