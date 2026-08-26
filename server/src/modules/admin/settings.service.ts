import db from '../../core/database/db';
import { v4 as uuidv4 } from 'uuid';

export interface PlatformSettingsMap {
  platform_name: string;
  platform_tagline: string;
  hero_headline: string;
  hero_subtitle: string;
  announcement_banner_enabled: boolean;
  announcement_banner_text: string;
  registrations_enabled: boolean;
  default_demo_balance: number;
  support_email: string;
  support_telegram: string;
  show_comparison_section: boolean;
  show_faq_section: boolean;
  show_journey_section: boolean;
  show_tech_pillars_section: boolean;
  theme_color_primary: string;
}

const DEFAULT_SETTINGS: PlatformSettingsMap = {
  platform_name: 'ApexTrader',
  platform_tagline: 'Institutional Platform',
  hero_headline: 'Trading Istituzionale. Esecuzione & Capitale Protetto.',
  hero_subtitle: 'Infrastruttura finanziaria avanzata per il monitoraggio di strategie quantitative, rendicontazione a doppia partita contabile e trading gestito da Desk centrale, con feed mondiali in streaming continuo ed estratti conto certificati.',
  announcement_banner_enabled: true,
  announcement_banner_text: '🔥 APEX ENGINE 2.0 • FEED GLOBALE SUB-MILLISECONDO ATTIVO',
  registrations_enabled: true,
  default_demo_balance: 0.0,
  support_email: 'desk@apextrader.demo',
  support_telegram: '@ApexTraderDesk',
  show_comparison_section: true,
  show_faq_section: true,
  show_journey_section: true,
  show_tech_pillars_section: true,
  theme_color_primary: 'cyan',
};

export class SettingsService {
  /**
   * Retrieves all platform settings formatted as a typed object.
   */
  public static getAllSettings(): PlatformSettingsMap {
    try {
      const rows = db.prepare('SELECT key, value FROM platform_settings').all() as { key: string; value: string }[];
      
      const map: Record<string, string> = {};
      for (const r of rows) {
        map[r.key] = r.value;
      }

      return {
        platform_name: map.platform_name || DEFAULT_SETTINGS.platform_name,
        platform_tagline: map.platform_tagline || DEFAULT_SETTINGS.platform_tagline,
        hero_headline: map.hero_headline || DEFAULT_SETTINGS.hero_headline,
        hero_subtitle: map.hero_subtitle || DEFAULT_SETTINGS.hero_subtitle,
        announcement_banner_enabled: map.announcement_banner_enabled !== undefined 
          ? map.announcement_banner_enabled === '1' || map.announcement_banner_enabled === 'true'
          : DEFAULT_SETTINGS.announcement_banner_enabled,
        announcement_banner_text: map.announcement_banner_text || DEFAULT_SETTINGS.announcement_banner_text,
        registrations_enabled: map.registrations_enabled !== undefined
          ? map.registrations_enabled === '1' || map.registrations_enabled === 'true'
          : DEFAULT_SETTINGS.registrations_enabled,
        default_demo_balance: map.default_demo_balance !== undefined
          ? Number(map.default_demo_balance)
          : DEFAULT_SETTINGS.default_demo_balance,
        support_email: map.support_email || DEFAULT_SETTINGS.support_email,
        support_telegram: map.support_telegram || DEFAULT_SETTINGS.support_telegram,
        show_comparison_section: map.show_comparison_section !== undefined
          ? map.show_comparison_section === '1' || map.show_comparison_section === 'true'
          : DEFAULT_SETTINGS.show_comparison_section,
        show_faq_section: map.show_faq_section !== undefined
          ? map.show_faq_section === '1' || map.show_faq_section === 'true'
          : DEFAULT_SETTINGS.show_faq_section,
        show_journey_section: map.show_journey_section !== undefined
          ? map.show_journey_section === '1' || map.show_journey_section === 'true'
          : DEFAULT_SETTINGS.show_journey_section,
        show_tech_pillars_section: map.show_tech_pillars_section !== undefined
          ? map.show_tech_pillars_section === '1' || map.show_tech_pillars_section === 'true'
          : DEFAULT_SETTINGS.show_tech_pillars_section,
        theme_color_primary: map.theme_color_primary || DEFAULT_SETTINGS.theme_color_primary,
      };
    } catch (err) {
      console.error('Error fetching platform settings:', err);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Updates platform settings with audit log tracking.
   */
  public static updateSettings(
    updates: Partial<PlatformSettingsMap>,
    adminId: string,
    ipAddress: string
  ): PlatformSettingsMap {
    const current = this.getAllSettings();

    const insertOrUpdate = db.prepare(`
      INSERT INTO platform_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    const updateTransaction = db.transaction(() => {
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) {
          let strVal: string;
          if (typeof v === 'boolean') {
            strVal = v ? '1' : '0';
          } else {
            strVal = String(v);
          }
          insertOrUpdate.run(k, strVal);
        }
      }

      // Log Audit Trail Entry
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, actor_role, action, target_entity, target_id, state_before, state_after, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        adminId,
        'ADMIN',
        'UPDATE_PLATFORM_SETTINGS',
        'PLATFORM_SETTINGS',
        'GLOBAL',
        JSON.stringify(current),
        JSON.stringify({ ...current, ...updates }),
        ipAddress
      );
    });

    updateTransaction();

    return this.getAllSettings();
  }
}
