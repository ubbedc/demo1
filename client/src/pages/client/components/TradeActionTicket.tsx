import React, { useState, useEffect } from 'react';
import { MarketQuote, PortfolioSummary } from '../../../types';
import { api } from '../../../services/api';
import { Button, Card, Badge, Input, Tabs } from '../../../components/ui';
import { formatPrice, formatCurrency } from '../../../utils/formatters';
import { triggerHaptic } from '../../../utils/haptics';
import { playOrderExecutedSound } from '../../../utils/soundEffects';
import { TrendingUp, TrendingDown, ShieldCheck, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TradeActionTicketProps {
  quote: MarketQuote | null;
  portfolio: PortfolioSummary | null;
  onOrderSuccess?: () => void;
  defaultSide?: 'BUY' | 'SELL';
  compact?: boolean;
}

export const TradeActionTicket: React.FC<TradeActionTicketProps> = ({
  quote,
  portfolio,
  onOrderSuccess,
  defaultSide = 'BUY',
  compact = false,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>(defaultSide);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<string>('1');
  const [isSLActive, setIsSLActive] = useState<boolean>(false);
  const [isTPActive, setIsTPActive] = useState<boolean>(false);
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setSide(defaultSide);
  }, [defaultSide]);

  // Set default quantity depending on asset class
  useEffect(() => {
    if (!quote) return;
    if (quote.assetClass === 'CRYPTO') {
      setQuantity('0.1');
    } else if (quote.assetClass === 'FOREX') {
      setQuantity('1000');
    } else if (quote.assetClass === 'STOCK') {
      setQuantity('10');
    } else {
      setQuantity('1');
    }
  }, [quote?.symbol, quote?.assetClass]);

  // Dynamic price calculation
  const execPrice = quote ? (side === 'BUY' ? quote.ask : quote.bid) : 0;
  const numQty = parseFloat(quantity) || 0;
  const notionalValue = numQty * execPrice;
  const freeBalance = portfolio?.freeBalance ?? 10000;
  const hasSufficientBalance = freeBalance >= notionalValue && notionalValue > 0;

  // Auto calculate sensible default TP/SL when toggled
  const handleToggleSL = () => {
    const next = !isSLActive;
    setIsSLActive(next);
    if (next && quote) {
      const distance = quote.last * 0.02; // 2% default risk
      const sl = side === 'BUY' ? quote.last - distance : quote.last + distance;
      setStopLossPrice(sl.toFixed(quote.assetClass === 'FOREX' ? 4 : 2));
    }
  };

  const handleToggleTP = () => {
    const next = !isTPActive;
    setIsTPActive(next);
    if (next && quote) {
      const distance = quote.last * 0.04; // 4% default reward (1:2 R:R)
      const tp = side === 'BUY' ? quote.last + distance : quote.last - distance;
      setTakeProfitPrice(tp.toFixed(quote.assetClass === 'FOREX' ? 4 : 2));
    }
  };

  // Quick percentage balance pills
  const handleQuickPercent = (percent: number) => {
    if (!quote || execPrice <= 0) return;
    triggerHaptic('light');
    const targetNotional = freeBalance * (percent / 100);
    let targetQty = targetNotional / execPrice;

    if (quote.assetClass === 'FOREX') {
      targetQty = Math.floor(targetQty);
    } else if (quote.assetClass === 'CRYPTO') {
      targetQty = parseFloat(targetQty.toFixed(4));
    } else {
      targetQty = Math.floor(targetQty);
    }

    if (targetQty <= 0) targetQty = quote.assetClass === 'CRYPTO' ? 0.01 : 1;
    setQuantity(targetQty.toString());
  };

  // 1% Risk Allocation calculation
  const handleApply1PercentRisk = () => {
    if (!quote || !isSLActive || execPrice <= 0) {
      handleToggleSL();
    }
    triggerHaptic('medium');
    const riskAmount = (portfolio?.equity || 10000) * 0.01; // 1% of total equity
    const sl = parseFloat(stopLossPrice) || (side === 'BUY' ? execPrice * 0.98 : execPrice * 1.02);
    const slDistance = Math.abs(execPrice - sl);

    if (slDistance > 0) {
      let riskQty = riskAmount / slDistance;
      if (quote?.assetClass === 'CRYPTO') {
        riskQty = parseFloat(riskQty.toFixed(4));
      } else {
        riskQty = Math.floor(riskQty) || 1;
      }
      setQuantity(riskQty.toString());
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    if (numQty <= 0) {
      setFeedback({ type: 'error', message: 'Inserisci una quantità valida maggiore di 0.' });
      return;
    }

    if (!hasSufficientBalance) {
      setFeedback({
        type: 'error',
        message: `Saldo libero insufficiente ($${freeBalance.toFixed(2)}). Richiesti: $${notionalValue.toFixed(2)}.`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const payload: any = {
        symbol: quote.symbol,
        side,
        quantity: numQty,
      };

      if (isTPActive && takeProfitPrice) {
        payload.takeProfitPrice = parseFloat(takeProfitPrice);
      }
      if (isSLActive && stopLossPrice) {
        payload.stopLossPrice = parseFloat(stopLossPrice);
      }

      await api.placeOrder(payload);

      // Play synthesized institutional chime & physical haptic
      playOrderExecutedSound();
      triggerHaptic('success');

      setFeedback({
        type: 'success',
        message: `Ordine ${side} eseguito a mercato: ${numQty} ${quote.symbol} @ $${execPrice.toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}!`,
      });

      if (onOrderSuccess) {
        onOrderSuccess();
      }

      // Auto-hide success message after 4s
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      triggerHaptic('warning');
      setFeedback({
        type: 'error',
        message: err.message || 'Errore durante l\'esecuzione dell\'ordine.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quote) {
    return (
      <Card variant="default" className="text-center py-8">
        <span className="text-xs text-slate-500 font-mono">Seleziona un asset per operare</span>
      </Card>
    );
  }

  return (
    <Card variant="default" padding={compact ? 'sm' : 'md'} className="font-mono space-y-3.5">
      {/* 1. Header & Live Exec Price */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white">{quote.symbol}</span>
          <Badge variant={quote.change24h >= 0 ? 'success' : 'danger'} size="sm">
            {quote.change24h >= 0 ? '+' : ''}{quote.change24h.toFixed(2)}%
          </Badge>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Prezzo Live</span>
          <span className="text-sm font-black text-cyan-300">
            {formatPrice(execPrice, quote.assetClass)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-3">
        {/* 2. Side Selector: BUY vs SELL */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={side === 'BUY' ? 'success' : 'secondary'}
            size="md"
            fullWidth
            onClick={() => setSide('BUY')}
            icon={<TrendingUp className="w-4 h-4" />}
            className={side === 'BUY' ? 'ring-2 ring-emerald-400/40' : 'opacity-70'}
          >
            <span>COMPRA</span>
            <span className="text-[11px] font-normal opacity-90 hidden xs:inline">
              ${quote.ask.toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}
            </span>
          </Button>

          <Button
            type="button"
            variant={side === 'SELL' ? 'danger' : 'secondary'}
            size="md"
            fullWidth
            onClick={() => setSide('SELL')}
            icon={<TrendingDown className="w-4 h-4" />}
            className={side === 'SELL' ? 'ring-2 ring-rose-400/40' : 'opacity-70'}
          >
            <span>VENDI</span>
            <span className="text-[11px] font-normal opacity-90 hidden xs:inline">
              ${quote.bid.toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}
            </span>
          </Button>
        </div>

        {/* 3. Order Type Segmented Control */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setOrderType('MARKET');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderType === 'MARKET' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              A Mercato
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setOrderType('LIMIT');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                orderType === 'LIMIT' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-500'
              }`}
            >
              Limite
            </button>
          </div>

          <span className="text-[10px] text-slate-500">Spread: ${(quote.ask - quote.bid).toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}</span>
        </div>

        {/* 4. Quantity Input */}
        <div className="space-y-1.5">
          <Input
            label={`Quantità (${quote.symbol.split('/')[0]})`}
            type="number"
            step={quote.assetClass === 'CRYPTO' ? '0.001' : quote.assetClass === 'FOREX' ? '100' : '1'}
            min="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            suffixAdornment={quote.symbol.split('/')[0]}
            placeholder="0.00"
          />

          {/* Quick Balance Percentage Pills */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {[10, 25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="flex-1 py-1 text-[10px] font-black rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer min-h-[32px]"
              >
                {pct === 100 ? 'MAX' : `${pct}%`}
              </button>
            ))}

            <button
              type="button"
              onClick={handleApply1PercentRisk}
              title="Calcola la size ottimale rispettando il rischio massimo dell'1% del conto"
              className="px-2 py-1 text-[10px] font-black rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1 min-h-[32px]"
            >
              <ShieldCheck className="w-3 h-3" />
              1% Risk
            </button>
          </div>
        </div>

        {/* 5. Collapsible SL / TP Risk Management */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSLActive}
                onChange={handleToggleSL}
                className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-rose-500/40 w-3.5 h-3.5"
              />
              <span className={`text-[11px] font-bold ${isSLActive ? 'text-rose-400' : 'text-slate-500'}`}>
                Stop Loss (SL)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTPActive}
                onChange={handleToggleTP}
                className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/40 w-3.5 h-3.5"
              />
              <span className={`text-[11px] font-bold ${isTPActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                Take Profit (TP)
              </span>
            </label>
          </div>

          {(isSLActive || isTPActive) && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {isSLActive ? (
                <Input
                  label="Prezzo Stop Loss"
                  type="number"
                  step="any"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="0.00"
                  prefixAdornment="$"
                />
              ) : <div />}

              {isTPActive ? (
                <Input
                  label="Prezzo Take Profit"
                  type="number"
                  step="any"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  placeholder="0.00"
                  prefixAdornment="$"
                />
              ) : <div />}
            </div>
          )}
        </div>

        {/* 6. Live Order Execution Summary */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Controvalore Nozionale:</span>
            <span className="font-bold text-white">${notionalValue.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Margine Richiesto:</span>
            <span className={`font-bold ${hasSufficientBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${notionalValue.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
            <span>Saldo Libero Residuo:</span>
            <span className="font-bold text-cyan-300">
              ${Math.max(0, freeBalance - notionalValue).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <span className="leading-snug">{feedback.message}</span>
          </div>
        )}

        {/* 7. Institutional Execution Button */}
        <Button
          type="submit"
          variant={side === 'BUY' ? 'success' : 'danger'}
          size="lg"
          fullWidth
          disabled={!hasSufficientBalance || isSubmitting || numQty <= 0}
          isLoading={isSubmitting}
          className="shadow-xl"
        >
          {side === 'BUY' ? (
            <span>COMPRA {quote.symbol} @ ${quote.ask.toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}</span>
          ) : (
            <span>VENDI {quote.symbol} @ ${quote.bid.toFixed(quote.assetClass === 'FOREX' ? 4 : 2)}</span>
          )}
        </Button>
      </form>
    </Card>
  );
};
