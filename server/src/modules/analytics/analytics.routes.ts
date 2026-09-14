import { Router, Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../../core/security/middleware';

const router = Router();

// Public Telemetry Collector (< 5ms response, non-blocking)
router.post('/public/telemetry', (req: Request, res: Response) => {
  try {
    const { sessionId, eventType, pagePath, eventData, deviceType } = req.body;
    if (!sessionId || !eventType) {
      res.status(400).json({ success: false, error: { message: 'Dati telemetria mancanti' } });
      return;
    }

    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    // Async record event
    analyticsService.recordEvent({
      sessionId,
      eventType,
      pagePath: pagePath || '/',
      eventData,
      deviceType: deviceType || (/mobile|iphone|android/i.test(userAgent) ? 'MOBILE' : 'DESKTOP'),
      userAgent,
      ipAddress: ip,
    });

    res.status(202).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Admin-Protected Analytics Dashboard Endpoint
router.get('/admin/analytics', authMiddleware, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = analyticsService.getAnalyticsSummary();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Admin-Protected Analytics Reset Endpoint
router.delete('/admin/analytics/reset', authMiddleware, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    analyticsService.resetAnalytics();
    res.json({ success: true, message: 'Dati telemetria azzerati con successo' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
