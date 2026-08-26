import { v4 as uuidv4 } from 'uuid';
import db from '../../core/database/db';

export interface AuditLogEntry {
  actorId: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  stateBefore?: any;
  stateAfter?: any;
  ipAddress?: string;
}

export class AuditService {
  public log(entry: AuditLogEntry): void {
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, actor_role, action, target_entity, target_id, state_before, state_after, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        entry.actorId,
        entry.actorRole,
        entry.action,
        entry.targetEntity,
        entry.targetId,
        entry.stateBefore ? JSON.stringify(entry.stateBefore) : null,
        entry.stateAfter ? JSON.stringify(entry.stateAfter) : null,
        entry.ipAddress || '127.0.0.1'
      );
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  public getLogs(limit = 100): any[] {
    return db.prepare(`
      SELECT 
        l.id, 
        l.actor_id, 
        u.email as actor_email, 
        l.actor_role, 
        l.action, 
        l.target_entity, 
        l.target_id, 
        l.state_before, 
        l.state_after, 
        l.ip_address, 
        l.created_at
      FROM audit_logs l
      LEFT JOIN users u ON u.id = l.actor_id
      ORDER BY l.created_at DESC
      LIMIT ?
    `).all(limit);
  }
}

export const auditService = new AuditService();
