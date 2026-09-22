import { Router, Request, Response } from 'express';
import { leadsService } from './leads.service';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../../core/security/middleware';

const router = Router();

// -----------------------------------------------------------------------------
// Public Endpoint: Lead Ingestion from Landing Page (CRO Engine)
// -----------------------------------------------------------------------------
router.post('/public/leads', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, experienceLevel, source, moduleId, moduleTitle } = req.body;

    if (!email || !email.trim()) {
      res.status(400).json({ success: false, error: { message: 'Indirizzo email obbligatorio.' } });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    const lead = leadsService.saveOrUpdateLead({
      fullName: fullName ? String(fullName).trim() : 'Operatore Quant',
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      experienceLevel: experienceLevel ? String(experienceLevel) : 'BEGINNER',
      source: source ? String(source) : 'google_ads_multistep_lp',
      moduleId: moduleId ? String(moduleId) : undefined,
      moduleTitle: moduleTitle ? String(moduleTitle) : undefined,
      ipAddress: ip,
    });

    res.status(201).json({
      success: true,
      data: {
        id: lead.id,
        status: lead.status,
        updatedAt: lead.updated_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// -----------------------------------------------------------------------------
// Admin CRM Endpoints (Strictly Protected)
// -----------------------------------------------------------------------------
router.get('/admin/leads', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, limit, offset } = req.query;

    const { leads, total } = leadsService.getLeads(
      search as string,
      status as string,
      limit ? parseInt(limit as string, 10) : 50,
      offset ? parseInt(offset as string, 10) : 0
    );

    const metrics = leadsService.getLeadsMetrics();

    res.json({
      success: true,
      data: {
        leads,
        total,
        metrics,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

router.patch('/admin/leads/:id', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const leadId = req.params.id;
    const { status, notes } = req.body;

    const updated = leadsService.updateLead(leadId, { status, notes });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

router.delete('/admin/leads/:id', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const leadId = req.params.id;
    const deleted = leadsService.deleteLead(leadId);

    if (!deleted) {
      res.status(404).json({ success: false, error: { message: 'Lead non trovato o già eliminato.' } });
      return;
    }

    res.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

export default router;
