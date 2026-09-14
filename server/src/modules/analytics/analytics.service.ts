import { v4 as uuidv4 } from 'uuid';
import db from '../../core/database/db';

export interface TelemetryEventDTO {
  sessionId: string;
  eventType: string;
  pagePath: string;
  eventData?: any;
  deviceType?: 'MOBILE' | 'DESKTOP' | 'TABLET';
  userAgent?: string;
  ipAddress?: string;
}

export class AnalyticsService {
  public recordEvent(dto: TelemetryEventDTO): void {
    const {
      sessionId,
      eventType,
      pagePath,
      eventData,
      deviceType = 'DESKTOP',
      userAgent = '',
      ipAddress = '127.0.0.1',
    } = dto;

    // Strict Filter: Never record admin or CRM desk pages
    if (pagePath.startsWith('/admin')) {
      return;
    }

    try {
      db.prepare(`
        INSERT INTO visitor_events (id, session_id, event_type, page_path, event_data, device_type, user_agent, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        sessionId,
        eventType,
        pagePath,
        eventData ? JSON.stringify(eventData) : null,
        deviceType,
        userAgent.substring(0, 255),
        ipAddress
      );
    } catch (err: any) {
      console.warn('[Analytics] Failed to record event:', err.message);
    }
  }

  public resetAnalytics(): void {
    try {
      db.prepare('DELETE FROM visitor_events').run();
    } catch (err: any) {
      console.warn('[Analytics] Failed to reset events:', err.message);
    }
  }

  public getAnalyticsSummary() {
    // 1. Live Active Visitors in the last 5 minutes (Guests & Clients only)
    const liveRes = db.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM visitor_events
      WHERE created_at >= datetime('now', '-5 minutes')
        AND page_path NOT LIKE '/admin%'
    `).get() as any;
    const activeVisitorsNow = liveRes?.count || 0;

    // 2. Visits Today & Unique Visitors Today
    const todayRes = db.prepare(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM visitor_events
      WHERE date(created_at) = date('now')
        AND page_path NOT LIKE '/admin%'
    `).get() as any;

    // 3. Unique Visitors Last 7 Days & 30 Days
    const last7Res = db.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM visitor_events
      WHERE created_at >= datetime('now', '-7 days')
        AND page_path NOT LIKE '/admin%'
    `).get() as any;

    const last30Res = db.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM visitor_events
      WHERE created_at >= datetime('now', '-30 days')
        AND page_path NOT LIKE '/admin%'
    `).get() as any;

    // 4. Device Breakdown (Last 30 Days)
    const devices = db.prepare(`
      SELECT device_type, COUNT(*) as count
      FROM visitor_events
      WHERE created_at >= datetime('now', '-30 days')
        AND page_path NOT LIKE '/admin%'
      GROUP BY device_type
    `).all() as any[];

    let mobileCount = 0;
    let desktopCount = 0;
    for (const d of devices) {
      if (d.device_type === 'MOBILE') mobileCount += d.count;
      else desktopCount += d.count;
    }
    const totalDevices = mobileCount + desktopCount || 1;

    // 5. Top Visited Pages (Public & Client Pages only)
    const topPages = db.prepare(`
      SELECT page_path, COUNT(*) as views
      FROM visitor_events
      WHERE event_type = 'PAGE_VIEW'
        AND page_path NOT LIKE '/admin%'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `).all();

    // 6. Conversion & Key Actions Breakdown
    const conversions = db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM visitor_events
      WHERE event_type != 'PAGE_VIEW'
        AND event_type != 'LIVE_PULSE'
        AND page_path NOT LIKE '/admin%'
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 7. Recent Activity Stream (Last 30 events)
    const recentActivity = db.prepare(`
      SELECT id, session_id, event_type, page_path, event_data, device_type, created_at
      FROM visitor_events
      WHERE page_path NOT LIKE '/admin%'
      ORDER BY created_at DESC
      LIMIT 30
    `).all();

    return {
      activeVisitorsNow,
      todayVisits: todayRes?.total_events || 0,
      todayUniqueVisitors: todayRes?.unique_visitors || 0,
      uniqueVisitors7Days: last7Res?.count || 0,
      uniqueVisitors30Days: last30Res?.count || 0,
      deviceBreakdown: {
        mobile: Math.round((mobileCount / totalDevices) * 100),
        desktop: Math.round((desktopCount / totalDevices) * 100),
        mobileCount,
        desktopCount,
      },
      topPages,
      conversions,
      recentActivity,
    };
  }
}

export const analyticsService = new AnalyticsService();
