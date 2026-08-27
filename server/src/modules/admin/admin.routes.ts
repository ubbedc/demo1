import { Router, Response } from 'express';
import { adminService } from './admin.service';
import { auditService } from '../audit/audit.service';
import { SettingsService } from './settings.service';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../../core/security/middleware';

const router = Router();

// All admin routes strictly require Admin authentication & authorization
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = adminService.getDashboardMetrics();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, role, status, limit, offset } = req.query;
    const users = adminService.getUsers(
      search as string,
      role as string,
      status as string,
      limit ? parseInt(limit as string, 10) : 50,
      offset ? parseInt(offset as string, 10) : 0
    );
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/users', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, fullName, initialBalance } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.createUserByAdmin(
      req.user!.userId,
      req.user!.role,
      { email, password, fullName, initialBalance: initialBalance ? Number(initialBalance) : 0 },
      ip
    );
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/positions', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const positions = adminService.getAllGlobalPositions();
    res.json({ success: true, data: positions });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const detail = adminService.getUserDetail(targetUserId);
    res.json({ success: true, data: detail });
  } catch (err: any) {
    res.status(404).json({ success: false, error: { message: err.message } });
  }
});

router.post('/users/:id/funds', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { amount, type, reason } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const updatedBalance = adminService.adjustDemoFunds(
      req.user!.userId,
      req.user!.role,
      targetUserId,
      Number(amount),
      type,
      reason,
      ip
    );
    res.json({ success: true, data: updatedBalance });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.patch('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, reason } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.setUserStatus(
      req.user!.userId,
      req.user!.role,
      targetUserId,
      status,
      reason,
      ip
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/users/:id/orders', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { symbol, side, quantity, takeProfitPrice, stopLossPrice, customExecutionDate, customDate } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.executeOrderForUser(
      req.user!.userId,
      req.user!.role,
      targetUserId,
      symbol,
      side,
      Number(quantity),
      takeProfitPrice ? Number(takeProfitPrice) : undefined,
      stopLossPrice ? Number(stopLossPrice) : undefined,
      customExecutionDate || customDate,
      ip
    );
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.put('/orders/:orderId/date', (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const { newDate } = req.body;
    if (!newDate) throw new Error('Data non valida.');
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.updateOrderDate(
      req.user!.userId,
      req.user!.role,
      orderId,
      newDate,
      ip
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.put('/transactions/:transactionId/date', (req: AuthenticatedRequest, res: Response) => {
  try {
    const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
    const { newDate } = req.body;
    if (!newDate) throw new Error('Data non valida.');
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.updateTransactionDate(
      req.user!.userId,
      req.user!.role,
      transactionId,
      newDate,
      ip
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/users/:id/positions/:posId/close', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const positionId = Array.isArray(req.params.posId) ? req.params.posId[0] : req.params.posId;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.closePositionForUser(
      req.user!.userId,
      req.user!.role,
      targetUserId,
      positionId,
      ip
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = adminService.deleteUser(
      req.user!.userId,
      req.user!.role,
      targetUserId,
      ip
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = auditService.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/settings', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = SettingsService.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const updated = SettingsService.updateSettings(req.body, req.user!.userId, ip);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
