import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  accountId?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, CONFIG.JWT_SECRET) as TokenPayload;
}
