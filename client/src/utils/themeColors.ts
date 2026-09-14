/**
 * ApexTrader Dynamic White-Label Theme Color Engine
 * Converts any HEX color code or preset into harmonious shades and sets CSS variables.
 */

const PRESET_MAP: Record<string, string> = {
  cyan: '#06b6d4',
  amber: '#f59e0b',
  gold: '#f59e0b',
  emerald: '#10b981',
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#a855f7',
  violet: '#a855f7',
  rose: '#f43f5e',
  red: '#f43f5e',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r + (percent > 0 ? (255 - rgb.r) * (percent / 100) : rgb.r * (percent / 100)))));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g + (percent > 0 ? (255 - rgb.g) * (percent / 100) : rgb.g * (percent / 100)))));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b + (percent > 0 ? (255 - rgb.b) * (percent / 100) : rgb.b * (percent / 100)))));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function applyCustomThemeColor(inputColor: string) {
  if (!inputColor) return;

  const hex = PRESET_MAP[inputColor.toLowerCase()] || (inputColor.startsWith('#') ? inputColor : `#${inputColor}`);
  const rgb = hexToRgb(hex);

  if (!rgb) {
    document.documentElement.setAttribute('data-theme', inputColor);
    return;
  }

  const root = document.documentElement;
  const primary300 = adjustBrightness(hex, 40);
  const primary400 = adjustBrightness(hex, 20);
  const primary500 = hex;
  const primary600 = adjustBrightness(hex, -20);

  root.style.setProperty('--primary-300', primary300);
  root.style.setProperty('--primary-400', primary400);
  root.style.setProperty('--primary-500', primary500);
  root.style.setProperty('--primary-600', primary600);
  root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  root.style.setProperty('--primary-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
  root.style.setProperty('--border-focus', primary500);
  root.style.setProperty('--brand-gradient', `linear-gradient(135deg, ${hex} 0%, ${primary600} 100%)`);
}
