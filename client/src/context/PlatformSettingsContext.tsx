import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformSettings } from '../types';
import { api } from '../services/api';
import { applyCustomThemeColor } from '../utils/themeColors';

const DEFAULT_SETTINGS: PlatformSettings = {
  platform_name: 'ApexTrader',
  platform_tagline: 'Institutional Platform',
  hero_headline: 'Trading Quantitativo. Analisi & Gestione del Rischio.',
  hero_subtitle: 'Infrastruttura didattica e di simulazione quantitativa per lo studio dei mercati finanziari, rendicontazione analitica a doppia partita e sperimentazione guidata in ambiente sandbox.',
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

interface PlatformSettingsContextType {
  settings: PlatformSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Partial<PlatformSettings>) => Promise<void>;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const PlatformSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Using default platform settings (fallback mode)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.theme_color_primary) {
      applyCustomThemeColor(settings.theme_color_primary);
    }
  }, [settings.theme_color_primary]);

  // Dynamically inject Google Tag (Google Ads / GA4) when configured in CMS
  useEffect(() => {
    if (settings.google_tag_id && settings.google_tag_id.trim()) {
      const tagId = settings.google_tag_id.trim();
      if (!document.getElementById('google-tag-script')) {
        const script = document.createElement('script');
        script.id = 'google-tag-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer?.push(args);
        }
        (window as any).gtag = gtag;
        gtag('js', new Date());
        gtag('config', tagId);
      }
    }
  }, [settings.google_tag_id]);

  const updateSettings = async (updates: Partial<PlatformSettings>) => {
    const updated = await api.updateAdminSettings(updates);
    setSettings(updated);
    if (updated.theme_color_primary) {
      applyCustomThemeColor(updated.theme_color_primary);
    }
  };

  return (
    <PlatformSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export const usePlatformSettings = () => useContext(PlatformSettingsContext);
