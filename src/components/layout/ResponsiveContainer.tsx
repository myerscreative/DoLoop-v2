import React from 'react';
import { View, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  sidebar: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  breakpoint?: number;
  layout?: 'standard' | 'productivity';
}

export const ResponsiveContainer: React.FC<Props> = ({ 
  sidebar, 
  rightPanel,
  children, 
  breakpoint = 768,
  layout = 'standard'
}) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  
  // Always show mobile layout on native apps
  const isDesktop = Platform.OS === 'web' && width >= breakpoint;

  if (isDesktop) {
    const isProductivity = layout === 'productivity';

    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.sidebarContainer}>
          {sidebar}
        </View>
        
        {/* Middle Column (Main Content) */}
        <View style={[
          styles.mainContent, 
          isProductivity ? styles.mainContentFixed : styles.mainContentFlex
        ]}>
          {children}
        </View>

        {/* Right Column (Panel) */}
        {rightPanel ? (
          <View style={[
            styles.rightPanelContainer,
            isProductivity ? styles.rightPanelFlex : styles.rightPanelFixed
          ]}>
            {rightPanel}
          </View>
        ) : (
             // If productivity mode and no right panel, we might want to fill space or show empty? 
             // For now, if no right panel in productivity, let main content take space if flexible? 
             // Actually, if rightPanel is missing in productivity mode, mainContentFixed acts as a sidebar...
             // Let's keep it simple: if rightPanel is missing, render nothing there.
             isProductivity && <View style={{ flex: 1, backgroundColor: colors.background }} />
        )}
      </View>
    );
  }

  // Mobile layout - just render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    overflow: 'hidden', 
  },
  sidebarContainer: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    height: '100%',
    overflow: 'hidden',
    zIndex: 10,
  },
  
  // Main Content Styles
  mainContent: {
    height: '100%',
    overflow: 'hidden',
  },
  mainContentFlex: {
    flex: 1,
    width: '100%',
  },
  mainContentFixed: {
    width: 340, // Fixed width for "List" view
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#ffffff', // Often lists are white
  },

  // Right Panel Styles
  rightPanelContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  rightPanelFixed: {
    width: 350,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  rightPanelFlex: {
    flex: 1,
    backgroundColor: '#ffffff', // The "Canvas" is usually white
  }
});
