import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'apextrader_dev_only_secret_change_in_production',
  JWT_EXPIRES_IN: '24h',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: path.resolve(__dirname, '../../trading_demo.db'),
  INITIAL_DEMO_BALANCE: 0.0,
  CORS_ORIGIN: process.env.CORS_ORIGIN || true,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'prova123',
};

// Called explicitly at server startup (not at module load / build time)
export function validateConfig(): void {
  if (CONFIG.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start in production.');
    process.exit(1);
  }
}


