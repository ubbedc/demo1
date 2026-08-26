import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/trading/client.routes';
import adminRoutes from './modules/admin/admin.routes';
import { marketService } from './modules/market-data/simulatedMarketService';

const app = express();

// Security Middlewares: Headers, CORS, Payload Limit
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Anti-Brute-Force Rate Limiter for Authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 5000 : 60,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Troppe richieste di autenticazione. Riprova tra pochi minuti.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import { SettingsService } from './modules/admin/settings.service';

// Public / Health Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ONLINE',
    system: 'ApexTrader Modular Monolith (Decoupled)',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/public/settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: SettingsService.getAllSettings(),
  });
});

app.get('/api/v1/markets/quotes', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: marketService.getAllQuotes(),
  });
});

import path from 'path';

// Mounted Modular Routers
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/client', clientRoutes);
app.use('/api/v1/admin', adminRoutes);

// Serve compiled React Frontend (Single-Port Production Deployment)
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: { message: 'Endpoint API non trovato' } });
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

export default app;
