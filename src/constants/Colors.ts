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
    
    
    // Vibe colors - UNIFIED GOLD BRAND
    structure: '#1E1B4B', // Midnight Navy (Anchor for depth)
    playful: '#FFB800', // Gold (Unified brand accent)
    focus: '#FFB800', // Gold (Unified brand accent)
    family: '#FFB800', // Gold (Unified brand accent)
    pro: '#FFB800', // Gold (Unified brand accent)
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
    
    // Vibe colors
    structure: '#312E81',
    playful: '#FEC00F',
    focus: '#FEC00F',
    family: '#FEC00F',
    pro: '#FEC00F',
  },
};

export type ColorTheme = keyof typeof Colors;

