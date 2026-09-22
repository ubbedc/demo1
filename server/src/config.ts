import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// In production, crash immediately if critical secrets are missing
if (isProd && !process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start in production.');
  process.exit(1);
}

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'apextrader_dev_only_secret_change_in_production',
  JWT_EXPIRES_IN: '24h',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: path.resolve(__dirname, '../../trading_demo.db'),
  INITIAL_DEMO_BALANCE: 0.0,
  CORS_ORIGIN: process.env.CORS_ORIGIN || true, // true = allow all in dev; set domain in prod
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'prova123', // Override via Railway env var
};

