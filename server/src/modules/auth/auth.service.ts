import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../../core/database/db';
import { generateToken } from '../../core/security/jwt';
import { CONFIG } from '../../config';

export class AuthService {
  public register(email: string, password: string, fullName: string) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      throw new Error('Un account con questo indirizzo email esiste già.');
    }

    const userId = uuidv4();
    const accountId = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);
    const accNumber = 'APX-' + Math.floor(100000 + Math.random() * 900000);

    const runTx = db.transaction(() => {
      // 1. Create User
      db.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, role, status)
        VALUES (?, ?, ?, ?, 'USER', 'ACTIVE')
      `).run(userId, email.toLowerCase().trim(), passwordHash, fullName.trim());

      // 2. Create Trading Account
      db.prepare(`
        INSERT INTO accounts (id, user_id, account_number, currency, status)
        VALUES (?, ?, ?, 'USD', 'ACTIVE')
      `).run(accountId, userId, accNumber);

      // 3. Initialize Demo Balance ($0.00 - Funds allocated via Admin CRM)
      db.prepare(`
        INSERT INTO balances (id, account_id, cash_balance, reserved_balance)
        VALUES (?, ?, 0.0, 0.0)
      `).run(uuidv4(), accountId);
    });

    runTx();

    const token = generateToken({
      userId,
      email: email.toLowerCase().trim(),
      role: 'USER',
      accountId,
    });

    return {
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        role: 'USER',
        accountId,
        accountNumber: accNumber,
      },
    };
  }

  public login(email: string, password: string) {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      throw new Error('Credenziali non valide. Verifica email e password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('Questo account è stato sospeso dall\'amministratore.');
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      throw new Error('Credenziali non valide. Verifica email e password.');
    }

    const account = db.prepare('SELECT id, account_number FROM accounts WHERE user_id = ?').get(user.id) as any;

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      accountId: account?.id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        accountId: account?.id,
        accountNumber: account?.account_number,
      },
    };
  }

  public getMe(userId: string) {
    const user = db.prepare('SELECT id, email, full_name, role, status, created_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) throw new Error('Utente non trovato.');

    const account = db.prepare('SELECT id, account_number, currency, status FROM accounts WHERE user_id = ?').get(userId) as any;

    return {
      ...user,
      account,
    };
  }
}

export const authService = new AuthService();
