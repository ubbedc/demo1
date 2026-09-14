import db from '../../core/database/db';
import { authService } from '../auth/auth.service';
import { accountsService } from '../accounts/accounts.service';
import { portfolioService } from '../portfolio/portfolio.service';
import { marketService } from '../market-data/simulatedMarketService';
import { tradingService } from '../trading/trading.service';
import { eventBus } from '../../core/events/eventBus';

export class AdminService {
  public getDashboardMetrics() {
    const totalUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'USER'").get() as any).c;
    const activeUsers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'USER' AND status = 'ACTIVE'").get() as any).c;
    const totalPositions = (db.prepare("SELECT COUNT(*) as c FROM positions WHERE status = 'OPEN'").get() as any).c;
    const totalOrders = (db.prepare("SELECT COUNT(*) as c FROM orders").get() as any).c;
    const totalVolume = (db.prepare("SELECT COALESCE(SUM(notional_value), 0) as v FROM orders").get() as any).v;
    const totalBalances = (db.prepare("SELECT COALESCE(SUM(cash_balance), 0) as b FROM balances").get() as any).b;

    return {
      totalUsers,
      activeUsers,
      totalPositions,
      totalOrders,
      totalVolume: Number(totalVolume.toFixed(2)),
      totalAllocatedDemoFunds: Number(totalBalances.toFixed(2)),
    };
  }

  public getUsers(search = '', role = '', status = '', limit = 50, offset = 0) {
    let query = `
      SELECT 
        u.id, 
        u.email, 
        u.full_name, 
        u.role, 
        u.status, 
        u.created_at,
        a.id as account_id,
        a.account_number,
        COALESCE(b.cash_balance, 0) as cash_balance
      FROM users u
      LEFT JOIN accounts a ON a.user_id = u.id
      LEFT JOIN balances b ON b.account_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (u.email LIKE ? OR u.full_name LIKE ? OR a.account_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    if (status) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  public getUserDetail(userId: string) {
    const user = db.prepare('SELECT id, email, full_name, role, status, created_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) throw new Error('Utente non trovato.');

    const account = db.prepare('SELECT id, account_number, currency, status, created_at FROM accounts WHERE user_id = ?').get(userId) as any;

    let balance = null;
    let portfolio = null;
    let positions: any[] = [];
    let orders: any[] = [];
    let transactions: any[] = [];

    if (account) {
      balance = accountsService.getBalance(account.id);
      portfolio = portfolioService.getPortfolioSummary(account.id);
      positions = portfolioService.getPositions(account.id, 'OPEN');
      orders = tradingService.getOrders(account.id, 20);
      transactions = accountsService.getTransactions(account.id, 20);
    }

    const auditHistory = db.prepare(`
      SELECT id, actor_id, actor_role, action, state_before, state_after, ip_address, created_at
      FROM audit_logs
      WHERE target_id = ? OR target_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId, account?.id || '');

    return {
      user,
      account,
      balance,
      portfolio,
      positions,
      orders,
      transactions,
      auditHistory,
    };
  }

  public adjustDemoFunds(
    adminId: string,
    adminRole: string,
    targetUserId: string,
    amount: number,
    type: 'ADD' | 'REMOVE',
    reason: string,
    ipAddress = '127.0.0.1'
  ) {
    const account = db.prepare('SELECT id, account_number FROM accounts WHERE user_id = ?').get(targetUserId) as any;
    if (!account) throw new Error('Account utente non trovato.');

    const stateBefore = accountsService.getBalance(account.id);

    let updatedBalance;
    if (type === 'ADD') {
      updatedBalance = accountsService.addFunds(
        account.id,
        Math.abs(amount),
        'ADMIN_ADJUSTMENT',
        `Accredito Manuale Admin: ${reason || 'Iniezione Fondi Demo CRM'}`,
        adminId
      );
    } else {
      updatedBalance = accountsService.deductFunds(
        account.id,
        Math.abs(amount),
        'ADMIN_ADJUSTMENT',
        `Storno Manuale Admin: ${reason || 'Rettifica Fondi Demo CRM'}`,
        adminId
      );
    }

    // Emit Domain Event (Decoupled Audit Logging)
    eventBus.emit('admin.funds_adjusted', {
      actorId: adminId,
      actorRole: adminRole,
      type,
      accountId: account.id,
      stateBefore: { cashBalance: stateBefore.cashBalance },
      stateAfter: { cashBalance: updatedBalance.cashBalance, reason, delta: type === 'ADD' ? amount : -amount },
      ipAddress,
    });

    return updatedBalance;
  }

  public setUserStatus(
    adminId: string,
    adminRole: string,
    targetUserId: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason: string,
    ipAddress = '127.0.0.1'
  ) {
    const user = db.prepare('SELECT id, email, status FROM users WHERE id = ?').get(targetUserId) as any;
    if (!user) throw new Error('Utente non trovato.');

    const stateBefore = { status: user.status };

    db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, targetUserId);

    eventBus.emit('admin.status_changed', {
      actorId: adminId,
      actorRole: adminRole,
      targetUserId,
      status,
      reason,
      stateBefore,
      stateAfter: { status, reason },
      ipAddress,
    });

    return { id: targetUserId, status };
  }

  public executeOrderForUser(
    adminId: string,
    adminRole: string,
    targetUserId: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    takeProfitPrice?: number,
    stopLossPrice?: number,
    customExecutionDate?: string,
    ipAddress = '127.0.0.1'
  ) {
    const account = db.prepare('SELECT id FROM accounts WHERE user_id = ?').get(targetUserId) as any;
    if (!account) throw new Error('Account utente non trovato.');

    const result = tradingService.executeMarketOrder({
      accountId: account.id,
      symbol,
      side,
      quantity,
      takeProfitPrice,
      stopLossPrice,
      customExecutionDate,
    });

    eventBus.emit('admin.order_executed', {
      actorId: adminId,
      actorRole: adminRole,
      targetUserId,
      accountId: account.id,
      order: result,
      takeProfitPrice,
      stopLossPrice,
      customExecutionDate,
      ipAddress,
    });

    return result;
  }

  public updateOrderDate(
    adminId: string,
    adminRole: string,
    orderId: string,
    newDate: string,
    ipAddress = '127.0.0.1'
  ) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) throw new Error('Ordine non trovato.');

    const stateBefore = { created_at: order.created_at, executed_at: order.executed_at };

    db.prepare('UPDATE orders SET created_at = ?, executed_at = ? WHERE id = ?').run(newDate, newDate, orderId);
    db.prepare('UPDATE transactions SET created_at = ? WHERE reference_id = ?').run(newDate, orderId);

    eventBus.emit('admin.order_date_updated', {
      actorId: adminId,
      actorRole: adminRole,
      orderId,
      stateBefore,
      stateAfter: { created_at: newDate, executed_at: newDate },
      ipAddress,
    });

    return { success: true, orderId, newDate };
  }

  public updateTransactionDate(
    adminId: string,
    adminRole: string,
    transactionId: string,
    newDate: string,
    ipAddress = '127.0.0.1'
  ) {
    const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId) as any;
    if (!tx) throw new Error('Transazione non trovata.');

    const stateBefore = { created_at: tx.created_at };

    db.prepare('UPDATE transactions SET created_at = ? WHERE id = ?').run(newDate, transactionId);

    eventBus.emit('admin.transaction_date_updated', {
      actorId: adminId,
      actorRole: adminRole,
      transactionId,
      stateBefore,
      stateAfter: { created_at: newDate },
      ipAddress,
    });

    return { success: true, transactionId, newDate };
  }

  public closePositionForUser(
    adminId: string,
    adminRole: string,
    targetUserId: string,
    positionId: string,
    ipAddress = '127.0.0.1'
  ) {
    const account = db.prepare('SELECT id FROM accounts WHERE user_id = ?').get(targetUserId) as any;
    if (!account) throw new Error('Account utente non trovato.');

    const result = portfolioService.closePosition(account.id, positionId);

    eventBus.emit('admin.position_closed', {
      actorId: adminId,
      actorRole: adminRole,
      targetUserId,
      accountId: account.id,
      positionId,
      result,
      ipAddress,
    });

    return result;
  }

  public deleteUser(adminId: string, adminRole: string, targetUserId: string, ipAddress = '127.0.0.1') {
    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(targetUserId) as any;
    if (!user) throw new Error('Utente non trovato.');
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      throw new Error('Impossibile eliminare un account amministratore.');
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);

    eventBus.emit('admin.status_changed', {
      actorId: adminId,
      actorRole: adminRole,
      targetUserId,
      newStatus: 'DELETED',
      reason: 'Eliminazione definitiva account utente da CRM',
      ipAddress,
    });

    return { deleted: true };
  }

  public createUserByAdmin(
    adminId: string,
    adminRole: string,
    payload: { email: string; password?: string; fullName: string; initialBalance?: number },
    ipAddress = '127.0.0.1'
  ) {
    const password = payload.password || 'Trader123!';
    const userReg = authService.register(payload.email, password, payload.fullName);

    if (payload.initialBalance && payload.initialBalance > 0) {
      this.adjustDemoFunds(
        adminId,
        adminRole,
        userReg.user.id,
        payload.initialBalance,
        'ADD',
        'Allocazione Capitale Iniziale da CRM Desk',
        ipAddress
      );
    }

    eventBus.emit('admin.user_created', {
      actorId: adminId,
      actorRole: adminRole,
      targetUserId: userReg.user.id,
      email: payload.email,
      initialBalance: payload.initialBalance || 0,
      ipAddress,
    });

    return userReg;
  }

  public getAllGlobalPositions() {
    const positions = db.prepare(`
      SELECT 
        p.id,
        p.account_id,
        p.asset_symbol,
        p.side,
        p.quantity,
        p.average_entry_price,
        p.status,
        p.realized_pnl,
        p.created_at,
        u.id as user_id,
        u.email as user_email,
        u.full_name as user_name,
        a.account_number
      FROM positions p
      JOIN accounts a ON a.id = p.account_id
      JOIN users u ON u.id = a.user_id
      WHERE p.status = 'OPEN'
      ORDER BY p.created_at DESC
    `).all() as any[];

    return positions.map((p) => {
      const quote = marketService.getQuote(p.asset_symbol);
      const livePrice = quote ? (p.side === 'LONG' ? quote.bid : quote.ask) : Number(p.average_entry_price);
      const qty = Number(p.quantity);
      const avg = Number(p.average_entry_price);
      const unrealizedPnL = p.side === 'LONG' ? qty * (livePrice - avg) : qty * (avg - livePrice);
      return {
        ...p,
        currentPrice: livePrice,
        unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
      };
    });
  }
}

export const adminService = new AdminService();
