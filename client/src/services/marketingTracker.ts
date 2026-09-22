/**
 * ApexTrader Marketing & Conversion Tracking Service
 * Integrates Google Ads (gtag.js / Conversion Tags), Google Analytics 4 (GA4),
 * Google Tag Manager (dataLayer) and Internal CRM Telemetry.
 */

import { trackAction } from './telemetry';

// Global declarations for third-party tag windows
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Dispatches conversion and analytics events to all configured tracking endpoints.
 */
function sendTrackingEvent(eventName: string, eventParams: Record<string, any> = {}) {
  // 1. Google Ads / GA4 gtag.js
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, eventParams);
    } catch (e) {
      console.warn('[MarketingTracker] gtag error:', e);
    }
  }

  // 2. Google Tag Manager dataLayer
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[MarketingTracker] dataLayer error:', e);
    }
  }

  // 3. Internal CRM Telemetry Collector (Stored in SQLite `visitor_events`)
  try {
    trackAction(eventName, eventParams);
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Tracks a High-Value Lead Generation Event (Macro-Conversion for Google Ads).
 * Example: User requested a PDF handbook or registered for certification progress.
 */
export function trackLeadGenerated(data: {
  email: string;
  name?: string;
  phone?: string;
  experienceLevel?: string;
  moduleId?: string;
  moduleTitle?: string;
  source?: string;
}) {
  sendTrackingEvent('generate_lead', {
    event_category: 'Lead Magnet',
    event_label: data.moduleId || 'general',
    lead_source: data.source || 'academy_pdf_handbook',
    module_id: data.moduleId,
    module_title: data.moduleTitle,
    has_phone: Boolean(data.phone),
    phone_prefix: data.phone ? data.phone.slice(0, 4) : undefined,
    experience_level: data.experienceLevel || 'NOT_SPECIFIED',
    // Google Ads enhanced conversion hashed identifier can be passed here
  });
}

/**
 * Tracks early stage lead capture (Step 2 of Multi-Step form) to prevent data loss.
 */
export function trackLeadPartial(data: {
  email: string;
  name?: string;
  experienceLevel?: string;
  moduleId?: string;
}) {
  sendTrackingEvent('lead_partial_captured', {
    event_category: 'Lead Magnet Step 2',
    event_label: data.moduleId || 'general',
    experience_level: data.experienceLevel || 'NOT_SPECIFIED',
  });
}

/**
 * Tracks Micro-Conversions on Interactive Math Simulators.
 * High time-on-page and slider interactions improve Google Ads Quality Score.
 */
export function trackSimulatorInteraction(
  moduleId: string,
  simulatorType: string,
  details?: Record<string, any>
) {
  sendTrackingEvent('simulator_interaction', {
    event_category: 'Engagement',
    event_label: `${moduleId}_${simulatorType}`,
    module_id: moduleId,
    simulator_type: simulatorType,
    ...details,
  });
}

/**
 * Tracks when a student starts a learning module.
 */
export function trackModuleStarted(moduleId: string, moduleTitle: string) {
  sendTrackingEvent('tutorial_begin', {
    event_category: 'Academy',
    event_label: moduleId,
    item_id: moduleId,
    item_name: moduleTitle,
  });
}

/**
 * Tracks when a student passes the quiz/challenge and earns XP.
 */
export function trackModuleCompleted(
  moduleId: string,
  moduleTitle: string,
  xpEarned: number
) {
  sendTrackingEvent('tutorial_complete', {
    event_category: 'Academy',
    event_label: moduleId,
    item_id: moduleId,
    item_name: moduleTitle,
    value: xpEarned,
  });
}

/**
 * Tracks when an official PDF handbook is downloaded.
 */
export function trackPdfDownload(moduleId: string, moduleTitle?: string) {
  sendTrackingEvent('download_handbook', {
    event_category: 'Content',
    event_label: moduleId,
    module_id: moduleId,
    module_title: moduleTitle,
  });
}

/**
 * Tracks CTA interaction prompting visitor to activate a $10,000 demo terminal.
 */
export function trackDemoAccountPrompt(source: string) {
  sendTrackingEvent('demo_account_prompt', {
    event_category: 'Conversion Funnel',
    event_label: source,
  });
}

export interface UtmCampaignData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  landing_url?: string;
  timestamp?: string;
}

/**
 * Parses and persists URL query parameters (UTM & gclid) for Google Ads campaign attribution.
 */
export function captureCampaignAttribution(): UtmCampaignData {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmData: UtmCampaignData = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
      gclid: params.get('gclid') || undefined,
      landing_url: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
    };

    if (utmData.utm_source || utmData.utm_campaign || utmData.gclid) {
      sessionStorage.setItem('apex_campaign_attribution', JSON.stringify(utmData));
      localStorage.setItem('apex_last_campaign_attribution', JSON.stringify(utmData));
    }

    return getStoredCampaignAttribution() || utmData;
  } catch (_) {
    return {};
  }
}

export function getStoredCampaignAttribution(): UtmCampaignData | null {
  try {
    const raw =
      sessionStorage.getItem('apex_campaign_attribution') ||
      localStorage.getItem('apex_last_campaign_attribution');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Tracks a dedicated Google Ads Landing Page view with campaign attribution.
 */
export function trackLandingPageView(topic: string, campaign?: string) {
  const attribution = getStoredCampaignAttribution() || {};
  sendTrackingEvent('landing_page_view', {
    event_category: 'Google Ads Landing',
    event_label: topic,
    landing_topic: topic,
    campaign_name: campaign || attribution.utm_campaign || 'direct',
    gclid: attribution.gclid,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
  });
}

