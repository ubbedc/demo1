import { v4 as uuidv4 } from 'uuid';
import db from '../../core/database/db';

export interface AccountBalance {
  id: string;
  accountId: string;
  cashBalance: number;
  reservedBalance: number;
  freeBalance: number;
  currency: string;
}

export class AccountsService {
  public getBalance(accountId: string): AccountBalance {
    const row = db.prepare(`
      SELECT b.id, b.account_id, b.cash_balance, b.reserved_balance, a.currency
      FROM balances b
      JOIN accounts a ON a.id = b.account_id
      WHERE b.account_id = ?
    `).get(accountId) as any;

    if (!row) {
      throw new Error(`Account balance non trovato per account ${accountId}`);
    }

    const cashBalance = Number(row.cash_balance);
    const reservedBalance = Number(row.reserved_balance);

    return {
      id: row.id,
      accountId: row.account_id,
      cashBalance,
      reservedBalance,
      freeBalance: cashBalance - reservedBalance,
      currency: row.currency,
    };
  }

  public getTransactions(accountId: string, limit = 50): any[] {
    return db.prepare(`
      SELECT id, account_id, type, amount, balance_after, description, reference_id, created_at
      FROM transactions
      WHERE account_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(accountId, limit);
  }

  public addFunds(
    accountId: string,
    amount: number,
    type: 'WELCOME_BONUS' | 'ADMIN_ADJUSTMENT' | 'TRADE_EXECUTION' | 'POSITION_CLOSE' | 'RESET',
    description: string,
    referenceId: string | null = null
  ): AccountBalance {
    const current = this.getBalance(accountId);
    const newCash = current.cashBalance + amount;

    const runTx = db.transaction(() => {
      // Update balance
      db.prepare(`
        UPDATE balances
        SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
        WHERE account_id = ?
      `).run(newCash, accountId);

      // Create transaction log
      db.prepare(`
        INSERT INTO transactions (id, account_id, type, amount, balance_after, description, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), accountId, type, amount, newCash, description, referenceId);
    });

    runTx();
    return this.getBalance(accountId);
  }

  public deductFunds(
    accountId: string,
    amount: number,
    type: 'ADMIN_ADJUSTMENT' | 'TRADE_EXECUTION' | 'POSITION_CLOSE',
    description: string,
    referenceId: string | null = null
  ): AccountBalance {
    const current = this.getBalance(accountId);
    if (current.freeBalance < amount) {
      throw new Error(`Saldo disponibile insufficiente ($${current.freeBalance.toFixed(2)}) per addebitare $${amount.toFixed(2)}`);
    }

    const newCash = current.cashBalance - amount;

    const runTx = db.transaction(() => {
      db.prepare(`
        UPDATE balances
        SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
        WHERE account_id = ?
      `).run(newCash, accountId);

      db.prepare(`
        INSERT INTO transactions (id, account_id, type, amount, balance_after, description, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), accountId, type, -amount, newCash, description, referenceId);
    });

    runTx();
    return this.getBalance(accountId);
  }
}

export const accountsService = new AccountsService();
