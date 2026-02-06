import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { VibeStyle } from '../types/onboarding';

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  isDark: boolean;
  vibe: VibeStyle;
  setVibe: (vibe: VibeStyle) => Promise<void>;
  setColorScheme: (scheme: 'light' | 'dark') => Promise<void>;
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
    textOnPrimary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Vibe-based color schemes — each theme has a distinct personality
const vibeColors: Record<VibeStyle, {
  light: { primary: string; accent: string; textOnPrimary: string };
  dark: { primary: string; accent: string; textOnPrimary: string };
}> = {
  playful: {
    light: { primary: '#FFB800', accent: '#FFD700', textOnPrimary: '#000000' }, // Honey Gold
    dark:  { primary: '#FEC00F', accent: '#FFD700', textOnPrimary: '#000000' },
  },
  focus: {
    light: { primary: '#475569', accent: '#334155', textOnPrimary: '#FFFFFF' }, // Slate & Professional
    dark:  { primary: '#64748B', accent: '#475569', textOnPrimary: '#FFFFFF' },
  },
  family: {
    light: { primary: '#E8723A', accent: '#D4622E', textOnPrimary: '#FFFFFF' }, // Warm Terracotta
    dark:  { primary: '#FB923C', accent: '#F97316', textOnPrimary: '#000000' },
  },
  pro: {
    light: { primary: '#0D9488', accent: '#0F766E', textOnPrimary: '#FFFFFF' }, // Mint & Modern
    dark:  { primary: '#14B8A6', accent: '#0D9488', textOnPrimary: '#FFFFFF' },
  },
};

const getColorsForVibe = (vibe: VibeStyle, isDark: boolean) => {
  const vibeColor = vibeColors[vibe][isDark ? 'dark' : 'light'];

  const base = isDark ? {
    background: '#121212',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#DC2626',
    structure: '#1A1A1A',
  } : {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E5E5E5',
    error: '#DC2626',
    structure: '#F5F5F5',
  };

  return {
    ...base,
    primary: vibeColor.primary,
    success: '#059669',
    secondary: vibeColor.accent,
    accent1: '#00CED1',              // Bright Teal (Weekly loops)
    accent2: '#8A2BE2',              // Blue Violet (Goals)
    accentYellow: '#FFB800',         // Gold (Daily loops — always gold)
    textOnPrimary: vibeColor.textOnPrimary,
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
          .select('theme_vibe, theme_mode')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.warn('[Theme] Error loading theme preference:', error);
        } else if (data) {
          if (data.theme_vibe) {
            setVibeState(data.theme_vibe as VibeStyle);
          }
          if (data.theme_mode) {
            setColorScheme(data.theme_mode as ColorSchemeName);
          }
        }
      } catch (error) {
        // console.warn('[Theme] Error loading theme preference:', error);
      } finally {
        // setLoading(false);
      }
    };

    loadThemePreference();
  }, [user]);

  // Note: We intentionally do NOT listen to system appearance changes here
  // because we want to respect the user's manual theme selection.
  // The theme preference is loaded from the database on mount and persisted
  // when the user changes it via the Settings screen.

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

  // Update color scheme preference in database
  const setColorSchemeFunc = async (scheme: 'light' | 'dark') => {
    const previousScheme = colorScheme;
    setColorScheme(scheme);
    
    if (!user) return;

    try {
      // Upsert user profile with new theme mode
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          theme_mode: scheme,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.warn('[Theme] Error saving theme mode preference:', error);
        // Revert on error
        setColorScheme(previousScheme);
      }
    } catch (error) {
      console.warn('[Theme] Error saving theme mode preference:', error);
      // Revert on error
      setColorScheme(previousScheme);
    }
  };

  const isDark = colorScheme === 'dark';
  const colors = getColorsForVibe(vibe, isDark);

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark, vibe, setVibe, setColorScheme: setColorSchemeFunc, colors }}>
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
