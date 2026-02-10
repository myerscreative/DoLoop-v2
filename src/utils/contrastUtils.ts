/**
 * Contrast Utilities for WCAG Accessibility
 * 
 * Validates and ensures WCAG AA compliance (4.5:1 contrast ratio) 
 * for gold brand color (#FEC00F) on various backgrounds.
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGBA string to RGB values
 */
function rgbaToRgb(rgba: string): { r: number; g: number; b: number; a: number } | null {
  const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i.exec(rgba.replace(/\s/g, ''));
  return result
    ? {
        r: parseInt(result[1], 10),
        g: parseInt(result[2], 10),
        b: parseInt(result[3], 10),
        a: result[4] ? parseFloat(result[4]) : 1,
      }
    : null;
}

/**
 * Calculate relative luminance for a color
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param foreground - Foreground color (hex or rgba)
 * @param background - Background color (hex or rgba)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(foreground: string, background: string): number {
  let fgRgb = hexToRgb(foreground);
  if (!fgRgb && foreground.startsWith('rgba')) {
    const rgb = rgbaToRgb(foreground);
    if (rgb) fgRgb = { r: rgb.r, g: rgb.g, b: rgb.b };
  }

  let bgRgb = hexToRgb(background);
  if (!bgRgb && background.startsWith('rgba')) {
    const rgb = rgbaToRgb(background);
    if (rgb) bgRgb = { r: rgb.r, g: rgb.g, b: rgb.b };
  }

  if (!fgRgb || !bgRgb) {
    console.warn('[contrastUtils] Invalid color format:', { foreground, background });
    return 1;
  }

  const l1 = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1)
 */
export function meetsWCAG_AA(ratio: number): boolean {
  return ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1)
 */
export function meetsWCAG_AAA(ratio: number): boolean {
  return ratio >= 7.0;
}

/**
 * Get an accessible shade of gold for the given background
 * Returns the brand gold if it passes WCAG AA, otherwise returns adjusted shade
 */
export function getAccessibleGoldShade(background: string): string {
  const BRAND_GOLD = '#FEC00F';
  const ratio = getContrastRatio(BRAND_GOLD, background);

  if (meetsWCAG_AA(ratio)) {
    return BRAND_GOLD;
  }

  // If brand gold doesn't meet contrast, try lighter shade
  const LIGHT_GOLD = '#FFD700'; // Lighter gold
  const lightRatio = getContrastRatio(LIGHT_GOLD, background);

  if (meetsWCAG_AA(lightRatio)) {
    return LIGHT_GOLD;
  }

  // If still doesn't meet, return white for maximum contrast
  console.warn(
    `[contrastUtils] Gold shades do not meet WCAG AA on background ${background}. Using white fallback.`
  );
  return '#FFFFFF';
}

/**
 * Validate all gold color combinations used in the app
 * @returns Array of validation results
 */
export function validateGoldContrasts(): Array<{
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
}> {
  const BRAND_GOLD = '#FEC00F';
  const backgrounds = [
    { name: 'Dark Background', color: '#121212' },
    { name: 'Glass Surface', color: 'rgba(30, 30, 30, 0.6)' },
    { name: 'Glass Backdrop', color: 'rgba(24, 24, 24, 0.95)' },
    { name: 'Radial Gradient Center', color: '#121212' },
    { name: 'Radial Gradient Edge', color: '#050505' },
  ];

  return backgrounds.map((bg) => {
    const ratio = getContrastRatio(BRAND_GOLD, bg.color);
    return {
      foreground: BRAND_GOLD,
      background: bg.color,
      ratio: Math.round(ratio * 100) / 100,
      passes: meetsWCAG_AA(ratio),
    };
  });
}
