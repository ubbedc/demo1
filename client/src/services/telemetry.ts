// Lightweight, privacy-first internal telemetry tracker (0 external trackers)
// STRICT FILTER: Admin activities and CRM visits are NEVER tracked to preserve pure client/guest metrics.

function getSessionId(): string {
  let sid = sessionStorage.getItem('apx_session_id');
  if (!sid) {
    sid = 'ses_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    sessionStorage.setItem('apx_session_id', sid);
  }
  return sid;
}

function getDeviceType(): 'MOBILE' | 'DESKTOP' | 'TABLET' {
  const ua = navigator.userAgent;
  if (/ipad|tablet/i.test(ua)) return 'TABLET';
  if (/mobile|iphone|android/i.test(ua)) return 'MOBILE';
  return 'DESKTOP';
}

function isExcludedAdmin(): boolean {
  try {
    // 1. Check current URL path
    if (window.location.pathname.startsWith('/admin')) return true;

    // 2. Check JWT token stored in localStorage
    const token = localStorage.getItem('apextrader_token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN') {
          return true; // Exclude admin traffic completely
        }
      }
    }
  } catch (_) {}
  return false;
}

export function trackPageView(pagePath: string) {
  if (isExcludedAdmin()) return; // Skip admin
  if (pagePath && pagePath.startsWith('/admin')) return; // Skip admin page

  try {
    const payload = {
      sessionId: getSessionId(),
      eventType: 'PAGE_VIEW',
      pagePath: pagePath || window.location.pathname,
      deviceType: getDeviceType(),
    };

    fetch('/api/v1/public/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (_) {}
}

export function trackAction(eventType: string, eventData?: Record<string, any>) {
  if (isExcludedAdmin()) return; // Skip admin

  try {
    const payload = {
      sessionId: getSessionId(),
      eventType,
      pagePath: window.location.pathname,
      eventData,
      deviceType: getDeviceType(),
    };

    fetch('/api/v1/public/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (_) {}
}

// Active session pulse every 30 seconds to keep live visitor radar accurate (Clients & Guests only)
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (!isExcludedAdmin()) {
      trackAction('LIVE_PULSE');
    }
  }, 30000);
}
