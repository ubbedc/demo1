import { v4 as uuidv4 } from 'uuid';
import db from '../../core/database/db';

export interface LeadDTO {
  fullName: string;
  email: string;
  phone?: string;
  experienceLevel?: string;
  source?: string;
  moduleId?: string;
  moduleTitle?: string;
  ipAddress?: string;
}

export interface LeadRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  experience_level: string;
  source: string;
  module_id: string | null;
  module_title: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  notes: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export class LeadsService {
  public saveOrUpdateLead(dto: LeadDTO): LeadRecord {
    const email = dto.email.toLowerCase().trim();
    const fullName = dto.fullName.trim();
    const phone = dto.phone ? dto.phone.trim() : null;
    const experienceLevel = dto.experienceLevel || 'BEGINNER';
    const source = dto.source || 'google_ads_multistep_lp';
    const moduleId = dto.moduleId || null;
    const moduleTitle = dto.moduleTitle || null;
    const ipAddress = dto.ipAddress || '127.0.0.1';

    // Check if a lead with this email already exists
    const existing = db.prepare('SELECT * FROM leads WHERE email = ?').get(email) as LeadRecord | undefined;

    if (existing) {
      // Update with new phone, level or module information without overriding status if already contacted
      db.prepare(`
        UPDATE leads 
        SET full_name = ?,
            phone = COALESCE(?, phone),
            experience_level = ?,
            module_id = COALESCE(?, module_id),
            module_title = COALESCE(?, module_title),
            ip_address = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(fullName, phone, experienceLevel, moduleId, moduleTitle, ipAddress, existing.id);

      return db.prepare('SELECT * FROM leads WHERE id = ?').get(existing.id) as LeadRecord;
    }

    // Insert brand new lead
    const newId = uuidv4();
    db.prepare(`
      INSERT INTO leads (id, full_name, email, phone, experience_level, source, module_id, module_title, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)
    `).run(newId, fullName, email, phone, experienceLevel, source, moduleId, moduleTitle, ipAddress);

    return db.prepare('SELECT * FROM leads WHERE id = ?').get(newId) as LeadRecord;
  }

  public getLeads(
    search?: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): { leads: LeadRecord[]; total: number } {
    let whereConditions: string[] = [];
    let params: any[] = [];

    if (search && search.trim()) {
      whereConditions.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR module_title LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'ALL') {
      whereConditions.push('status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as c FROM leads ${whereClause}`;
    const total = (db.prepare(countQuery).get(...params) as any).c;

    const dataQuery = `
      SELECT * FROM leads 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const leads = db.prepare(dataQuery).all(...params, limit, offset) as LeadRecord[];

    return { leads, total };
  }

  public updateLead(
    leadId: string,
    updates: { status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'; notes?: string }
  ): LeadRecord {
    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as LeadRecord | undefined;
    if (!existing) {
      throw new Error('Lead non trovato.');
    }

    const newStatus = updates.status || existing.status;
    const newNotes = updates.notes !== undefined ? updates.notes : existing.notes;

    db.prepare(`
      UPDATE leads 
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, newNotes, leadId);

    return db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as LeadRecord;
  }

  public deleteLead(leadId: string): boolean {
    const info = db.prepare('DELETE FROM leads WHERE id = ?').run(leadId);
    return info.changes > 0;
  }

  public getLeadsMetrics(): {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    convertedLeads: number;
    phoneCapturedCount: number;
    phoneCaptureRate: number;
  } {
    const total = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any).c;
    const newCount = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'NEW'").get() as any).c;
    const contacted = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'CONTACTED'").get() as any).c;
    const converted = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'CONVERTED'").get() as any).c;
    const withPhone = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE phone IS NOT NULL AND TRIM(phone) != ''").get() as any).c;

    const phoneRate = total > 0 ? Math.round((withPhone / total) * 100) : 0;

    return {
      totalLeads: total,
      newLeads: newCount,
      contactedLeads: contacted,
      convertedLeads: converted,
      phoneCapturedCount: withPhone,
      phoneCaptureRate: phoneRate,
    };
  }
}

export const leadsService = new LeadsService();
