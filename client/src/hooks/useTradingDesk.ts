import { useState } from 'react';
import { api } from '../services/api';
import { MarketQuote, PortfolioSummary } from '../types';

export function useTradingDesk(
  selectedQuote: MarketQuote | null,
  portfolio: PortfolioSummary | null,
  onSuccess: () => void
) {
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<string>('0.1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const price = selectedQuote ? (orderSide === 'BUY' ? selectedQuote.ask : selectedQuote.bid) : 0;
  const numQty = parseFloat(quantity) || 0;
  const notional = numQty * price;

  const stepQuantity = (delta: number) => {
    const current = parseFloat(quantity) || 0;
    const next = Math.max(0.001, Number((current + delta).toFixed(4)));
    setQuantity(String(next));
  };

  const setPercentQuantity = (pct: number) => {
    if (!portfolio || !price || price <= 0) return;
    const targetCapital = portfolio.freeBalance * (pct / 100);
    const calculatedQty = targetCapital / price;
    const decimals = selectedQuote?.assetClass === 'FOREX' ? 0 : 3;
    setQuantity(calculatedQty.toFixed(decimals));
  };

  const executeOrder = async () => {
    if (!selectedQuote || numQty <= 0) {
      setFeedback({ type: 'error', message: 'Inserisci una quantità valida maggiore di zero.' });
      return;
    }

    if (orderSide === 'BUY' && portfolio && portfolio.freeBalance < notional) {
      setFeedback({
        type: 'error',
        message: `Saldo disponibile non sufficiente ($${portfolio.freeBalance.toFixed(2)}) per coprire $${notional.toFixed(2)}.`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await api.placeOrder({
        symbol: selectedQuote.symbol,
        side: orderSide,
        quantity: numQty,
      });

      setFeedback({
        type: 'success',
        message: `Ordine ${orderSide} ${numQty} ${selectedQuote.symbol} eseguito con successo a $${price.toLocaleString()}!`,
      });

      onSuccess();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Errore durante l\'esecuzione dell\'ordine.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      await api.closePosition(positionId);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Errore durante la chiusura della posizione.');
    }
  };

  return {
    orderSide,
    setOrderSide,
    quantity,
    setQuantity,
    price,
    numQty,
    notional,
    isSubmitting,
    feedback,
    setFeedback,
    stepQuantity,
    setPercentQuantity,
    executeOrder,
    closePosition,
  };
}
