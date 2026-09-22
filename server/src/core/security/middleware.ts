import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from './jwt';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { fullName?: string; status?: string };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token di autenticazione mancante o formato non valido.' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);

    // Verify user still exists and is not suspended
    const user = db.prepare('SELECT id, email, full_name, role, status FROM users WHERE id = ?').get(decoded.userId) as any;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Utente associato al token non trovato.' },
      });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        error: { code: 'USER_SUSPENDED', message: 'Il tuo account è stato sospeso dall\'amministratore.' },
      });
      return;
    }

    // Get primary account ID if not present in token
    let accountId = decoded.accountId;
    if (!accountId) {
      const account = db.prepare('SELECT id FROM accounts WHERE user_id = ?').get(user.id) as any;
      if (account) {
        accountId = account.id;
      } else {
        // Auto-provision a trading account for users who don't have one yet
        const newAccountId = uuidv4();
        const accNumber = 'APX-' + Math.floor(100000 + Math.random() * 900000);
        const provisionTx = db.transaction(() => {
          db.prepare(`INSERT INTO accounts (id, user_id, account_number, currency, status) VALUES (?, ?, ?, 'USD', 'ACTIVE')`)
            .run(newAccountId, user.id, accNumber);
          db.prepare(`INSERT INTO balances (id, account_id, cash_balance, reserved_balance) VALUES (?, ?, 0.0, 0.0)`)
            .run(uuidv4(), newAccountId);
        });
        provisionTx();
        accountId = newAccountId;
      }
    }

    req.user = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      accountId,
    };

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token di sessione scaduto o non valido.' },
    });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Accesso riservato agli amministratori CRM.' },
    });
    return;
  }
  next();
}
