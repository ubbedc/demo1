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

// 4. Start 24/7 Keep-Alive Self-Pinger in Production
if (CONFIG.NODE_ENV === 'production' || process.env.RENDER_EXTERNAL_URL) {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || 'https://apptest-oef2.onrender.com';
  console.log(`📡 Keep-Alive Engine Active: Pinging ${targetUrl}/api/v1/health every 9 minutes`);
  
  setInterval(async () => {
    try {
      const res = await fetch(`${targetUrl}/api/v1/health`);
      if (res.ok) {
        console.log(`[Keep-Alive] Heartbeat pulse sent (${new Date().toISOString()})`);
      }
    } catch (err: any) {
      console.warn(`[Keep-Alive] Heartbeat pulse warning:`, err.message);
    }
  }, 9 * 60 * 1000);
}

process.on('SIGTERM', () => {
  marketService.stopTickLoop();
  server.close(() => {
    console.log('Server terminated cleanly.');
  });
});
