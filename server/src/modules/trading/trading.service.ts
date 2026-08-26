import { v4 as uuidv4 } from 'uuid';
import db from '../../core/database/db';
import { marketService } from '../market-data/simulatedMarketService';
import { accountsService } from '../accounts/accounts.service';

export interface PlaceOrderDTO {
  accountId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
}

export class TradingService {
  public executeMarketOrder(dto: PlaceOrderDTO) {
    const { accountId, symbol, side, quantity, takeProfitPrice, stopLossPrice } = dto;

    if (!quantity || quantity <= 0) {
      throw new Error('La quantità dell\'ordine deve essere maggiore di zero.');
    }

    const quote = marketService.getQuote(symbol);
    if (!quote) {
      throw new Error(`Asset ${symbol} non trovato o non disponibile.`);
    }

    // Execution price: BUY executes at Ask, SELL executes at Bid
    const execPrice = side === 'BUY' ? quote.ask : quote.bid;
    const notionalValue = Number((quantity * execPrice).toFixed(4));

    const balance = accountsService.getBalance(accountId);

    // Validate balance for both BUY and SELL (100% cash-backed / margin covered)
    if (balance.freeBalance < notionalValue) {
      throw new Error(
        `Saldo disponibile non sufficiente ($${balance.freeBalance.toFixed(2)}) per coprire l'operazione ($${notionalValue.toFixed(2)}).`
      );
    }

    const orderId = uuidv4();
    let positionId = '';

    const runTx = db.transaction(() => {
      // 1. Record Filled Order
      db.prepare(`
        INSERT INTO orders (id, account_id, asset_symbol, side, type, status, quantity, executed_price, notional_value)
        VALUES (?, ?, ?, ?, 'MARKET', 'FILLED', ?, ?, ?)
      `).run(orderId, accountId, symbol, side, quantity, execPrice, notionalValue);

      // 2. Adjust Balance / Deduct collateral for BUY or SELL
      accountsService.deductFunds(
        accountId,
        notionalValue,
        'TRADE_EXECUTION',
        `Esecuzione Ordine ${side} ${quantity} ${symbol} @ $${execPrice}`,
        orderId
      );

      // 3. Update or Create Position
      const existingPos = db.prepare(`
        SELECT * FROM positions
        WHERE account_id = ? AND asset_symbol = ? AND side = ? AND status = 'OPEN'
      `).get(accountId, symbol, side === 'BUY' ? 'LONG' : 'SHORT') as any;

      if (existingPos) {
        positionId = existingPos.id;
        const oldQty = Number(existingPos.quantity);
        const oldAvg = Number(existingPos.average_entry_price);
        const newQty = oldQty + quantity;
        const newAvg = Number((((oldQty * oldAvg) + (quantity * execPrice)) / newQty).toFixed(quote.assetClass === 'FOREX' ? 4 : 2));

        db.prepare(`
          UPDATE positions
          SET quantity = ?, average_entry_price = ?,
              take_profit_price = COALESCE(?, take_profit_price),
              stop_loss_price = COALESCE(?, stop_loss_price)
          WHERE id = ?
        `).run(newQty, newAvg, takeProfitPrice || null, stopLossPrice || null, existingPos.id);
      } else {
        positionId = uuidv4();
        db.prepare(`
          INSERT INTO positions (id, account_id, asset_symbol, side, quantity, average_entry_price, take_profit_price, stop_loss_price, status, realized_pnl)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', 0.0)
        `).run(
          positionId,
          accountId,
          symbol,
          side === 'BUY' ? 'LONG' : 'SHORT',
          quantity,
          execPrice,
          takeProfitPrice || null,
          stopLossPrice || null
        );
      }
    });

    runTx();

    return {
      orderId,
      positionId,
      symbol,
      side,
      quantity,
      executedPrice: execPrice,
      notionalValue,
      status: 'FILLED',
      executedAt: new Date().toISOString(),
    };
  }

  public getOrders(accountId: string, limit = 50): any[] {
    return db.prepare(`
      SELECT id, account_id, asset_symbol, side, type, status, quantity, executed_price, notional_value, created_at, executed_at
      FROM orders
      WHERE account_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(accountId, limit);
  }
}

export const tradingService = new TradingService();
