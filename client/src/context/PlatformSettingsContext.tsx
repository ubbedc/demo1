import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlatformSettings } from '../types';
import { api } from '../services/api';
import { applyCustomThemeColor } from '../utils/themeColors';

const DEFAULT_SETTINGS: PlatformSettings = {
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
