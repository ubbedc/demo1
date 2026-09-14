import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { authMiddleware, AuthenticatedRequest } from '../../core/security/middleware';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ success: false, error: { message: 'Email, password e nome completo sono obbligatori.' } });
      return;
    }
    const result = authService.register(email, password, fullName);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: { message: 'Email e password sono obbligatorie.' } });
      return;
    }
    const result = authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: { message: err.message } });
  }
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = authService.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
