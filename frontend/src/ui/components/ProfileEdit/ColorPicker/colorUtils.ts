/**
 * Hex ↔ HSV conversion for the profile ColorPicker (no external deps).
 * Hex is normalized to #rrggbb.
 */

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const c = hexToRgb(hex);
  if (!c) return { h: 0, s: 0, v: 0 };
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const h = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

export function normalizeHex(hex: string): string {
  hex = (hex || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  if (/^[0-9a-f]{6}$/i.test(hex)) return '#' + hex;
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    const r = hex[1] + hex[1], g = hex[2] + hex[2], b = hex[3] + hex[3];
    return '#' + r + g + b;
  }
  return '#000000';
}
