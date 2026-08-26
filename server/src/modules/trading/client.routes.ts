import { Router, Response } from 'express';
import { portfolioService } from '../portfolio/portfolio.service';
import { tradingService } from './trading.service';
import { accountsService } from '../accounts/accounts.service';
import { authMiddleware, AuthenticatedRequest } from '../../core/security/middleware';

const router = Router();

// All client routes strictly require user authentication
router.use(authMiddleware);

router.get('/portfolio', (req: AuthenticatedRequest, res: Response) => {
  try {
    const portfolio = portfolioService.getPortfolioSummary(req.user!.accountId!);
    res.json({ success: true, data: portfolio });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/positions', (req: AuthenticatedRequest, res: Response) => {
  try {
    const positions = portfolioService.getPositions(req.user!.accountId!, 'OPEN');
    res.json({ success: true, data: positions });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/positions/:id/close', (req: AuthenticatedRequest, res: Response) => {
  try {
    const positionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = portfolioService.closePosition(req.user!.accountId!, positionId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/orders', (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = tradingService.getOrders(req.user!.accountId!, 50);
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/orders', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { symbol, side, quantity } = req.body;
    const result = tradingService.executeMarketOrder({
      accountId: req.user!.accountId!,
      symbol,
      side,
      quantity: Number(quantity),
    });
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.get('/transactions', (req: AuthenticatedRequest, res: Response) => {
  try {
    const txs = accountsService.getTransactions(req.user!.accountId!, 50);
    res.json({ success: true, data: txs });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/reset-demo', (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = accountsService.addFunds(
      req.user!.accountId!,
      10000.0,
      'RESET',
      'Demo Account Balance Reload'
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
