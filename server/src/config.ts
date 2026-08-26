import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'apextrader_super_secure_jwt_secret_dev_2026',
  JWT_EXPIRES_IN: '24h',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: path.resolve(__dirname, '../../trading_demo.db'),
  INITIAL_DEMO_BALANCE: 0.0,
};
