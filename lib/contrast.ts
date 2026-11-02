function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Ratio WCAG 2.1, arrondi à une décimale. */
export function contrastRatio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  return Math.round(ratio * 10) / 10;
}

export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'AA large' | 'fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'fail';
}
