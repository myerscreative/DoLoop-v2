import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { VibeStyle } from '../types/onboarding';

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  isDark: boolean;
  vibe: VibeStyle;
  setVibe: (vibe: VibeStyle) => Promise<void>;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    success: string;
    secondary: string;
    accent1: string;
    accent2: string;
    accentYellow: string;
    border: string;
    error: string;
    structure: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Vibe-based color schemes
// UNIFIED GOLD BRAND: All vibes use the gold palette from mockup
const vibeColors: Record<VibeStyle, { primary: string; accent: string }> = {
  playful: { primary: '#FFB800', accent: '#FFD700' }, // Honey Gold + Bright Gold
  focus: { primary: '#FFB800', accent: '#FFD700' },   // Unified
  family: { primary: '#FFB800', accent: '#FFD700' },  // Unified
  pro: { primary: '#FFB800', accent: '#FFD700' },     // Unified
};

const getColorsForVibe = (vibe: VibeStyle, isDark: boolean) => {
  const vibeColor = vibeColors[vibe];
  // Light mode colors matching the mockup exactly
  const base = isDark ? {
    background: '#121212',     // Deep dark charcoal
    surface: 'rgba(255, 255, 255, 0.05)', // Glassmorphism surface
    text: '#FFFFFF',           // 100% white for visual anchor
    textSecondary: 'rgba(255, 255, 255, 0.4)', // 40% grey for "fade"
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#DC2626',
    structure: '#1A1A1A',
  } : {
    background: '#FFFFFF',     // Pure white for main areas
    surface: '#FAFAFA',        // Light gray for list backgrounds
    text: '#1A1A1A',           // Almost black for primary text
    textSecondary: '#666666',  // Medium gray for secondary text
    border: '#E5E5E5',         // Light border
    error: '#DC2626',
    structure: '#F5F5F5',      // Lighter gray for input backgrounds
  };

  return {
    ...base,
    primary: vibeColor.primary,      // #FFB800 - Main gold
    success: '#059669', 
    secondary: vibeColor.accent,      // #FFD700 - Bright gold
    accent1: '#00CED1',               // Bright Teal (Weekly)
    accent2: '#8A2BE2',               // Blue Violet (Goals)
    accentYellow: '#FFB800',          // Vibrant Gold (Daily)
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Default to dark mode as per "Second Self" philosophy
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('dark');
  const [vibe, setVibeState] = useState<VibeStyle>('playful'); // Default to playful (gold/bee theme)
  // const [loading, setLoading] = useState(true);

  // Load user's theme preference from profile
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!user) {
        // setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('theme_vibe')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.warn('[Theme] Error loading theme preference:', error);
        } else if (data?.theme_vibe) {
          setVibeState(data.theme_vibe as VibeStyle);
        }
      } catch (error) {
        // console.warn('[Theme] Error loading theme preference:', error);
      } finally {
        // setLoading(false);
      }
    };

    loadThemePreference();
  }, [user]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      // Keep dark mode as the "Second Self" primary experience
      setColorScheme('dark');
    });

    return () => subscription.remove();
  }, []);

  // Update vibe preference in database
  const setVibe = async (newVibe: VibeStyle) => {
    setVibeState(newVibe);
    
    if (!user) return;

    try {
      // Upsert user profile with new theme
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          theme_vibe: newVibe,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        // console.warn('[Theme] Error saving theme preference:', error);
        // Revert on error
        setVibeState(vibe);
      }
    } catch (error) {
      // console.warn('[Theme] Error saving theme preference:', error);
      // Revert on error
      setVibeState(vibe);
    }
  };

  const isDark = colorScheme === 'dark';
  const colors = getColorsForVibe(vibe, isDark);

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark, vibe, setVibe, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
