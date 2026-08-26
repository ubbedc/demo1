/**
 * Native Haptic Feedback Utility (Web Vibration API)
 * Triggers physical tactile vibrations on smartphones without affecting desktop.
 */

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !navigator || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch (_) {
    // Graceful fallback if device permissions disallow vibration
  }
}
