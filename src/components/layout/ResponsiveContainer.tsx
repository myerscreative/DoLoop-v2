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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.sidebarContainer}>
          {sidebar}
        </View>
        
        {/* Middle Column (Main Content) */}
        <View style={[
          styles.mainContent, 
          isProductivity ? [styles.mainContentFixed, { backgroundColor: colors.surface }] : styles.mainContentFlex
        ]}>
          {children}
        </View>

        {/* Right Column (Panel) */}
        {rightPanel && (
          <View style={[
            styles.rightPanelContainer,
            isProductivity ? [styles.rightPanelFlex, { backgroundColor: colors.background }] : [styles.rightPanelFixed, { backgroundColor: colors.background }]
          ]}>
            {rightPanel}
          </View>
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
    gap: 0,
  },
  sidebarContainer: {
    width: 80, // Match NavigationBlade width
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
    flex: 1, // Allow main content to flex and fill available space
    flexShrink: 0,
  },

  // Right Panel Styles
  rightPanelContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  rightPanelFixed: {
    width: 350,
  },
  rightPanelFlex: {
    flex: 1,
  }
});
