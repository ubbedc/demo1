import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { PortfolioSummary, Position } from '../../types';
import { InteractiveChart } from '../../components/common/InteractiveChart';
import { ClientPortfolioCard } from './components/ClientPortfolioCard';
import { StatementExportModal } from '../../components/common/StatementExportModal';
import { Activity } from 'lucide-react';

interface MobileWorkspaceProps {
  portfolio: PortfolioSummary | null;
  positions: Position[];
  onRefreshData: () => void;
}

export const MobileTradingWorkspace: React.FC<MobileWorkspaceProps> = ({
  portfolio,
  positions,
}) => {
  const { selectedQuote } = useMarket();
  const { user } = useAuth();
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const quote = selectedQuote;

  return (
    <div className="space-y-4">
      {/* 1. Mobile Chart */}
      <div className="flex flex-col min-h-[300px]">
        <InteractiveChart quote={quote} />
      </div>

      {/* 2. Executive Portfolio Card (Apple Wallet / Revolut Ultra Style) */}
      <ClientPortfolioCard
        portfolio={portfolio}
        positions={positions}
        accountNumber={user?.accountNumber}
        onOpenStatement={() => setIsStatementOpen(true)}
      />

      {/* 3. Mobile Positions List (Read-Only Live Monitor) */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Posizioni dal Vivo ({positions.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Live Tick Feed</span>
        </div>

        {positions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-mono text-xs space-y-1">
            <span className="block text-sm">🛡️ Nessuna operazione attiva</span>
            <span className="text-[11px] text-slate-600">Le strategie a mercato aperte dal Risk Desk appariranno qui.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((pos) => {
              const isProfit = pos.unrealizedPnL >= 0;
              return (
                <div
                  key={pos.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${pos.side === 'LONG' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                        {pos.side}
                      </span>
                      <span className="font-bold text-white text-xs">{pos.assetSymbol}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {pos.quantity} @ ${pos.averageEntryPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-sm block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">GESTITA CRM</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statement Export Modal */}
      {isStatementOpen && (
        <StatementExportModal
          portfolio={portfolio}
          onClose={() => setIsStatementOpen(false)}
        />
      )}
    </div>
  );
};
