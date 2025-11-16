import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  isDark: boolean;
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
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors = {
  background: '#FFFEF7', // Warm off-white
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#FFB800', // Brand primary (golden yellow)
  success: '#00E5A2', // Success green
  secondary: '#FF1E88', // Hot pink
  accent1: '#2EC4B6', // Turquoise/cyan
  accent2: '#9B51E0', // Purple
  accentYellow: '#FFB800', // Brand yellow
  border: '#E5E7EB',
  error: '#EF4444',
};

const darkColors = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  primary: '#FFB800', // Brand primary (golden yellow)
  success: '#00E5A2', // Success green
  secondary: '#FF1E88', // Hot pink
  accent1: '#2EC4B6', // Turquoise/cyan
  accent2: '#9B51E0', // Purple
  accentYellow: '#FFB800', // Brand yellow
  border: '#374151',
  error: '#F87171',
};

// Detect system theme preference
const getSystemColorScheme = (): ColorSchemeName => {
  return Appearance.getColorScheme();
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Force light mode to show off the vibrant new theme
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Keep light mode even if system changes
      setColorScheme('light');
    });

    return () => subscription.remove();
  }, []);

  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark, colors }}>
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
