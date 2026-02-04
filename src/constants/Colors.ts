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
    background: '#09090B', // Zinc 950
    backgroundSecondary: '#18181B', // Zinc 900
    surface: '#27272A', // Zinc 800
    text: '#F4F4F5', // Zinc 100
    textSecondary: '#A1A1AA', // Zinc 400
    primary: '#FFB800', // Vibrant Gold
    success: '#10B981', // Emerald 500
    error: '#EF4444', // Red 500
    border: '#3F3F46', // Zinc 700
    
    
    // Vibe colors - UNIFIED GOLD BRAND
    structure: '#312E81', // Indigo 900
    playful: '#FFB800', // Gold
    focus: '#FFB800', // Gold
    family: '#FFB800', // Gold
    pro: '#FFB800', // Gold
  },
};

export type ColorTheme = keyof typeof Colors;

