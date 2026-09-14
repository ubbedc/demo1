import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { PortfolioSummary, Position } from '../../types';
import { InteractiveChart } from '../../components/common/InteractiveChart';
import { ClientPortfolioCard } from './components/ClientPortfolioCard';
import { DesktopOrderBook } from './components/DesktopOrderBook';
import { DesktopAssetMonitor } from './components/DesktopAssetMonitor';
import { TradeActionTicket } from './components/TradeActionTicket';
import { StatementExportModal } from '../../components/common/StatementExportModal';
import { Button, Card, Badge, Tabs, BottomSheet, EmptyState } from '../../components/ui';
import { api } from '../../services/api';
import { formatPrice, formatCurrency, formatPercent } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { playClosePositionSound } from '../../utils/soundEffects';
import {
  Activity,
  LineChart,
  Layers,
  Wallet,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  XCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface MobileWorkspaceProps {
  portfolio: PortfolioSummary | null;
  positions: Position[];
  onRefreshData: () => void;
}

export const MobileTradingWorkspace: React.FC<MobileWorkspaceProps> = ({
  portfolio,
  positions,
  onRefreshData,
}) => {
  const { quotes, selectedSymbol, selectedQuote, setSelectedSymbol, priceDirections } = useMarket();
  const { user } = useAuth();

  // Mobile navigation tabs
  const [activeTab, setActiveTab] = useState<'chart' | 'markets' | 'positions' | 'portfolio'>('chart');

  // Trade BottomSheet state
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');

  // Modals & Async Actions
  const [isStatementOpen, setIsStatementOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  const quote = selectedQuote;

  const handleOpenTrade = (side: 'BUY' | 'SELL') => {
    setTradeSide(side);
    setIsTradeOpen(true);
  };

  const handleClosePosition = async (posId: string) => {
    try {
      setClosingId(posId);
      triggerHaptic('medium');
      await api.closePosition(posId);
      playClosePositionSound();
      triggerHaptic('success');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Errore durante la chiusura della posizione.');
    } finally {
      setClosingId(null);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      triggerHaptic('medium');
      await api.resetDemoBalance();
      triggerHaptic('success');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Errore durante il reset del conto.');
    } finally {
      setIsResetting(false);
    }
  };

  const navOptions = [
    { id: 'chart' as const, label: 'Grafico', icon: <LineChart className="w-4 h-4" /> },
    { id: 'markets' as const, label: 'Mercati', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'positions' as const,
      label: 'Posizioni',
      icon: <Activity className="w-4 h-4" />,
      badge: positions.length > 0 ? positions.length : undefined,
    },
    { id: 'portfolio' as const, label: 'Conto', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-3 font-mono pb-24 select-none">
      {/* 1. Mobile Quick Status Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Saldo Disponibile</span>
          <span className="text-base font-black text-white">
            {formatCurrency(portfolio?.freeBalance || 10000)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            isLoading={isResetting}
            icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
            title="Ricarica $10,000 Demo"
          >
            Ricarica
          </Button>

          {quote && (
            <button
              type="button"
              onClick={() => setActiveTab('markets')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 cursor-pointer text-xs font-black text-white"
            >
              <span>{quote.symbol}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Mobile Tab Segmented Control */}
      <Tabs
        options={navOptions}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        size="md"
      />

      {/* 3. Main Views */}

      {/* VIEW A: Chart & Live Depth */}
      {activeTab === 'chart' && (
        <div className="space-y-3">
          {quote && (
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-white">{quote.symbol}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase">
                  {quote.assetClass}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-white block">
                  {formatPrice(quote.last, quote.assetClass)}
                </span>
                <span className={`text-[11px] font-bold ${quote.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(quote.change24h)}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Chart */}
          <div className="flex flex-col min-h-[320px]">
            <InteractiveChart quote={quote} />
          </div>

          {/* Order Book Level II */}
          <DesktopOrderBook quote={quote} />
        </div>
      )}

      {/* VIEW B: Markets Watchlist */}
      {activeTab === 'markets' && (
        <div className="min-h-[450px]">
          <DesktopAssetMonitor
            quotes={quotes}
            selectedSymbol={selectedSymbol}
            priceDirections={priceDirections}
            onSelectSymbol={(sym) => {
              setSelectedSymbol(sym);
              setActiveTab('chart');
            }}
          />
        </div>
      )}

      {/* VIEW C: Active Positions with One-Tap Close */}
      {activeTab === 'positions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Posizioni Aperte ({positions.length})
            </span>
            <span className="text-[11px] text-cyan-400 font-bold">Liquidazione a Mercato</span>
          </div>

          {positions.length === 0 ? (
            <Card variant="default">
              <EmptyState
                icon={<Activity className="w-6 h-6 text-cyan-400" />}
                title="Nessuna posizione aperta"
                description="Usa i tasti Compra / Vendi in basso per aprire la tua prima operazione didattica a mercato."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('chart')}
                  >
                    Vai al Grafico
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2.5">
              {positions.map((pos) => {
                const isLong = pos.side === 'LONG';
                const isProfit = (pos.unrealizedPnL || 0) >= 0;
                const isClosing = closingId === pos.id;

                return (
                  <Card key={pos.id} variant="default" padding="md" className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isLong ? 'success' : 'danger'} size="sm">
                            {pos.side}
                          </Badge>
                          <span className="font-black text-white text-sm">{pos.assetSymbol}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          {pos.quantity} unità @ {formatPrice(pos.averageEntryPrice)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-base font-black block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(pos.unrealizedPnL)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">P/L Non Realizzato</span>
                      </div>
                    </div>

                    {/* SL & TP info row */}
                    {(pos.stopLossPrice || pos.takeProfitPrice) && (
                      <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-slate-800/80">
                        {pos.stopLossPrice && (
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            SL: ${pos.stopLossPrice}
                          </span>
                        )}
                        {pos.takeProfitPrice && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            TP: ${pos.takeProfitPrice}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action button (Touch Target 48px) */}
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <Button
                        variant="danger"
                        size="md"
                        fullWidth
                        disabled={isClosing}
                        isLoading={isClosing}
                        onClick={() => handleClosePosition(pos.id)}
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        Chiudi Posizione a Mercato
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW D: Portfolio Summary */}
      {activeTab === 'portfolio' && (
        <div className="space-y-3">
          <ClientPortfolioCard
            portfolio={portfolio}
            positions={positions}
            accountNumber={user?.accountNumber}
            onOpenStatement={() => setIsStatementOpen(true)}
          />
        </div>
      )}

      {/* 4. Sticky Bottom Action Bar (Thumb Zone) */}
      {/* Always visible on Chart and Markets tabs. z-[60] to be above BottomNav z-50. */}
      {(activeTab === 'chart' || activeTab === 'markets') && (
        <aside
          aria-label="Barra Azioni Trading Rapide"
          className="fixed bottom-16 left-0 right-0 z-[60] px-3 select-none"
        >
          <div className="max-w-xl mx-auto grid grid-cols-2 gap-2 p-2 bg-slate-950/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/60">
            {quote ? (
              <>
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  onClick={() => handleOpenTrade('SELL')}
                  icon={<TrendingDown className="w-4 h-4" />}
                  haptic="medium"
                >
                  <div className="flex flex-col items-start leading-none">
                    <span className="font-black">VENDI</span>
                    <span className="text-[11px] font-normal opacity-80 mt-0.5">
                      {formatPrice(quote.bid, quote.assetClass)}
                    </span>
                  </div>
                </Button>

                <Button
                  variant="success"
                  size="lg"
                  fullWidth
                  onClick={() => handleOpenTrade('BUY')}
                  icon={<TrendingUp className="w-4 h-4" />}
                  haptic="medium"
                >
                  <div className="flex flex-col items-start leading-none">
                    <span className="font-black">COMPRA</span>
                    <span className="text-[11px] font-normal opacity-80 mt-0.5">
                      {formatPrice(quote.ask, quote.assetClass)}
                    </span>
                  </div>
                </Button>
              </>
            ) : (
              <div className="col-span-2 text-center text-xs text-slate-500 py-2 font-mono animate-pulse">
                Caricamento quotazioni in tempo reale...
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 5. Trade Action BottomSheet (Sliding Drawer from bottom) */}
      <BottomSheet
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <span className={tradeSide === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
              {tradeSide === 'BUY' ? 'COMPRA LONG' : 'VENDI SHORT'}
            </span>
            <span>{quote?.symbol}</span>
          </span>
        }
        subtitle="Esecuzione istantanea nel simulatore didattico"
      >
        <TradeActionTicket
          quote={quote}
          portfolio={portfolio}
          defaultSide={tradeSide}
          compact
          onOrderSuccess={() => {
            onRefreshData();
            // Don't auto-close immediately so user can see the success confirmation
          }}
        />
      </BottomSheet>

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
