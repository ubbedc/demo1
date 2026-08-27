// Lightweight, privacy-first internal telemetry tracker (0 external trackers)

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

export function trackPageView(pagePath: string) {
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
