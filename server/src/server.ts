import app from './app';
import { CONFIG } from './config';
import { seedDatabase } from './core/database/seed';
import { marketService } from './modules/market-data/simulatedMarketService';

// 1. Initialize & Seed Database
seedDatabase();

// 2. Start Real-time Market Data Simulation Loop (Every 1.2s)
marketService.startTickLoop(1200);

// 3. Start HTTP Server
const server = app.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`
  =======================================================
  🚀 APEXTRADER PLATFORM — MODULAR MONOLITH SERVER
  =======================================================
  📡 Server Listening on:  http://localhost:${CONFIG.PORT}
  📊 Health Check:          http://localhost:${CONFIG.PORT}/api/health
  📈 Simulated Market Feed: ACTIVE (1200ms tick cycle)
  🛡️  Security / RBAC:      STRICT JWT & AUDIT TRAIL ENABLED
  =======================================================
  `);
});

process.on('SIGTERM', () => {
  marketService.stopTickLoop();
  server.close(() => {
    console.log('Server terminated cleanly.');
  });
});
