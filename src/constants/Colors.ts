/**
 * DoLoop Brand Colors
 * Locked Brand Kit - Primary #FEC00F, Success #00E5A2
 */

export const Colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#FAFAFA', // Crisp neutral
    surface: '#F4F4F5', // Cool Zinc
    text: '#18181B', // Jet Black
    textSecondary: '#52525B', // Slate 600
    primary: '#FFB800', // Vibrant Gold (Pop)
    success: '#059669', // Emerald 600
    error: '#DC2626', // Red 600
    border: '#E4E4E7', // Zinc 200
    
    
    // Vibe colors - Distinct theme palettes
    structure: '#1E1B4B', // Midnight Navy (Anchor for depth)
    playful: '#FFB800', // Honey Gold
    focus: '#475569',   // Slate 600
    family: '#E8723A',  // Warm Terracotta
    pro: '#0D9488',     // Teal 600 (Mint)
  },
  dark: {
    background: '#0F1115', // Atmospheric Dark (Navy-Charcoal)
    backgroundSecondary: '#1C1F26', // Surface Base
    surface: 'rgba(28, 31, 38, 0.8)', // Glass Surface
    text: '#FFFFFF', // Pure White for high contrast
    textSecondary: '#94A3B8', // Cool Grey (Slate 400) for metadata
    primary: '#FEC00F', // Branding Gold
    success: '#00E5A2', // Vibrant Success
    error: '#EF4444', 
    border: 'rgba(255, 255, 255, 0.1)', // Subtle Shine
    
    // Vibe colors - Distinct theme palettes
    structure: '#312E81',
    playful: '#FEC00F', // Bright Gold
    focus: '#64748B',   // Slate 500 (lighter for dark bg)
    family: '#FB923C',  // Orange 400 (brighter for dark bg)
    pro: '#14B8A6',     // Teal 400 (brighter for dark bg)
  },
};

export type ColorTheme = keyof typeof Colors;

