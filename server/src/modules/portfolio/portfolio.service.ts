import db from '../../core/database/db';
import { marketService } from '../market-data/simulatedMarketService';
import { accountsService } from '../accounts/accounts.service';

export interface EnrichedPosition {
  id: string;
  accountId: string;
  assetSymbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  takeProfitPrice?: number | null;
  stopLossPrice?: number | null;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  notionalValue: number;
  status: 'OPEN' | 'CLOSED';
  realizedPnL: number;
  openedAt: string;
  closedAt: string | null;
}

export class PortfolioService {
  public getPositions(accountId: string, status = 'OPEN'): EnrichedPosition[] {
    const rawPositions = db.prepare(`
      SELECT id, account_id, asset_symbol, side, quantity, average_entry_price, take_profit_price, stop_loss_price, status, realized_pnl, opened_at, closed_at
      FROM positions
      WHERE account_id = ? AND status = ?
      ORDER BY opened_at DESC
    `).all(accountId, status) as any[];

    const result: EnrichedPosition[] = [];

    for (const pos of rawPositions) {
      const quote = marketService.getQuote(pos.asset_symbol);
      const curPrice = quote ? (pos.side === 'LONG' ? quote.bid : quote.ask) : Number(pos.average_entry_price);
      const qty = Number(pos.quantity);
      const avg = Number(pos.average_entry_price);
      const entryNotional = qty * avg;
      const tp = pos.take_profit_price ? Number(pos.take_profit_price) : null;
      const sl = pos.stop_loss_price ? Number(pos.stop_loss_price) : null;

      // Auto-Trigger TP / SL check on open positions
      if (pos.status === 'OPEN' && quote) {
        const hitTP = tp && ((pos.side === 'LONG' && curPrice >= tp) || (pos.side === 'SHORT' && curPrice <= tp));
        const hitSL = sl && ((pos.side === 'LONG' && curPrice <= sl) || (pos.side === 'SHORT' && curPrice >= sl));

        if (hitTP || hitSL) {
          try {
            this.closePosition(accountId, pos.id);
            continue; // Skip returning as OPEN position
          } catch (_) {}
        }
      }

      let unrealizedPnL = 0;
      let unrealizedPnLPct = 0;

      if (pos.status === 'OPEN') {
        if (pos.side === 'LONG') {
          unrealizedPnL = (curPrice - avg) * qty;
        } else {
          unrealizedPnL = (avg - curPrice) * qty;
        }
        unrealizedPnLPct = entryNotional > 0 ? (unrealizedPnL / entryNotional) * 100 : 0;
      }

      result.push({
        id: pos.id,
        accountId: pos.account_id,
        assetSymbol: pos.asset_symbol,
        side: pos.side,
        quantity: qty,
        averageEntryPrice: avg,
        currentPrice: curPrice,
        takeProfitPrice: tp,
        stopLossPrice: sl,
        unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
        unrealizedPnLPct: Number(unrealizedPnLPct.toFixed(2)),
        notionalValue: Number((qty * curPrice).toFixed(2)),
        status: pos.status,
        realizedPnL: Number(pos.realized_pnl),
        openedAt: pos.opened_at,
        closedAt: pos.closed_at,
      });
    }

    return result;
  }

  public closePosition(accountId: string, positionId: string) {
    const pos = db.prepare(`
      SELECT * FROM positions
      WHERE id = ? AND account_id = ? AND status = 'OPEN'
    `).get(positionId, accountId) as any;

    if (!pos) {
      throw new Error('Posizione non trovata o già chiusa.');
    }

    const quote = marketService.getQuote(pos.asset_symbol);
    if (!quote) {
      throw new Error(`Quotazione di mercato non disponibile per ${pos.asset_symbol}.`);
    }

    const closePrice = pos.side === 'LONG' ? quote.bid : quote.ask;
    const qty = Number(pos.quantity);
    const avg = Number(pos.average_entry_price);

    let realizedPnL = 0;
    if (pos.side === 'LONG') {
      realizedPnL = (closePrice - avg) * qty;
    } else {
      realizedPnL = (avg - closePrice) * qty;
    }

    // Capital to return to cash balance = Entry Cost + Realized PnL
    const returnCapital = (qty * avg) + realizedPnL;

    const runTx = db.transaction(() => {
      // 1. Mark position as closed
      db.prepare(`
        UPDATE positions
        SET status = 'CLOSED', realized_pnl = ?, closed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(Number(realizedPnL.toFixed(4)), positionId);

      // 2. Settle cash into account balance
      accountsService.addFunds(
        accountId,
        Number(returnCapital.toFixed(4)),
        'POSITION_CLOSE',
        `Chiusura Posizione ${pos.side} ${qty} ${pos.asset_symbol} @ $${closePrice} (P/L: ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)})`,
        positionId
      );
    });

    runTx();

    return {
      positionId,
      status: 'CLOSED',
      closePrice,
      realizedPnL: Number(realizedPnL.toFixed(2)),
      returnCapital: Number(returnCapital.toFixed(2)),
      closedAt: new Date().toISOString(),
    };
  }

  public getPortfolioSummary(accountId: string) {
    const balance = accountsService.getBalance(accountId);
    const openPositions = this.getPositions(accountId, 'OPEN');

    let totalUnrealizedPnL = 0;
    let totalInvestedValue = 0;

    for (const pos of openPositions) {
      totalUnrealizedPnL += pos.unrealizedPnL;
      totalInvestedValue += pos.notionalValue;
    }

    const equity = balance.cashBalance + totalUnrealizedPnL;

    return {
      accountId,
      currency: balance.currency,
      cashBalance: balance.cashBalance,
      freeBalance: balance.freeBalance,
      reservedBalance: balance.reservedBalance,
      totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
      totalUnrealizedPnL: Number(totalUnrealizedPnL.toFixed(2)),
      equity: Number(equity.toFixed(2)),
      openPositionsCount: openPositions.length,
    };
  }
}

export const portfolioService = new PortfolioService();
